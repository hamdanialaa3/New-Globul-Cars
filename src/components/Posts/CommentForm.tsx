// Comment Form Component - Add new comments
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { commentsService } from '../../services/social/comments.service';

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onCommentAdded?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentCommentId,
  onCommentAdded,
  onCancel,
  placeholder
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = {
    bg: {
      placeholder: placeholder || 'Напиши коментар...',
      submit: 'Публикувай',
      cancel: 'Откажи',
      loginRequired: 'Моля, влезте за да коментирате',
      minLength: 'Коментарът трябва да е поне 3 символа',
      success: 'Коментарът е публикуван',
      error: 'Грешка при публикуване'
    },
    en: {
      placeholder: placeholder || 'Write a comment...',
      submit: 'Post',
      cancel: 'Cancel',
      loginRequired: 'Please login to comment',
      minLength: 'Comment must be at least 3 characters',
      success: 'Comment posted',
      error: 'Error posting comment'
    }
  };

  const text = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.warning(text.loginRequired);
      return;
    }

    if (content.trim().length < 3) {
      toast.warning(text.minLength);
      return;
    }

    try {
      setSubmitting(true);
      
      await commentsService.createComment(currentUser.uid, {
        postId,
        content: content.trim(),
        parentCommentId
      });

      setContent('');
      
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      toast.error(text.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <LoginPrompt>
        {text.loginRequired}
      </LoginPrompt>
    );
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={text.placeholder}
        disabled={submitting}
        maxLength={1000}
      />
      
      <FormFooter>
        <CharCount $warning={content.length > 900}>
          {content.length}/1000
        </CharCount>
        
        <ButtonGroup>
          {onCancel && (
            <CancelButton type="button" onClick={onCancel}>
              {text.cancel}
            </CancelButton>
          )}
          
          <SubmitButton
            type="submit"
            disabled={submitting || content.trim().length < 3}
          >
            <Send size={16} />
            {text.submit}
          </SubmitButton>
        </ButtonGroup>
      </FormFooter>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.form`
  width: 100%;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 12px 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Martica', 'Arial', sans-serif;
  resize: vertical;
  background: white;

  &:focus {
    outline: none;
    border-color: #003366;
    box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const CharCount = styled.span<{ $warning?: boolean }>`
  font-size: 12px;
  color: ${props => props.$warning ? '#e74c3c' : '#666'};
  font-weight: ${props => props.$warning ? '600' : '400'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    border-color: #ccc;
  }
`;

const SubmitButton = styled.button`
  padding: 8px 16px;
  background: #003366;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #002244;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 51, 102, 0.2);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginPrompt = styled.div`
  padding: 16px;
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  margin: 12px 0;
`;

export default CommentForm;
