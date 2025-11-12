// Post Comments Component - Display and manage comments
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Heart, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { Comment, commentsService } from '@/services/social/comments.service';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';

interface PostCommentsProps {
  postId: string;
  onCommentAdded?: () => void;
}

export const PostComments: React.FC<PostCommentsProps> = ({ postId, onCommentAdded }) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const data = await commentsService.getComments(postId, 50);
        setComments(data);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentsService.getComments(postId, 50);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!currentUser) return;
    
    try {
      await commentsService.likeComment(commentId, currentUser.uid);
      await loadComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!currentUser || !editContent.trim()) return;
    
    try {
      await commentsService.updateComment(commentId, currentUser.uid, editContent);
      setEditingComment(null);
      setEditContent('');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!currentUser) return;
    
    if (!window.confirm(language === 'bg' ? 'Изтриване на коментар?' : 'Delete comment?')) {
      return;
    }
    
    try {
      await commentsService.deleteComment(commentId, currentUser.uid);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: language === 'bg' ? bg : enUS
    });
  };

  if (loading) {
    return <LoadingContainer>Loading comments...</LoadingContainer>;
  }

  if (comments.length === 0) {
    return (
      <EmptyState>
        {language === 'bg' ? 'Все още няма коментари' : 'No comments yet'}
      </EmptyState>
    );
  }

  return (
    <CommentsContainer>
      {comments.map(comment => (
        <CommentItem key={comment.id}>
          <CommentHeader>
            <AuthorInfo>
              <AuthorAvatar src={comment.authorInfo.profileImage || '/default-avatar.png'} />
              <AuthorDetails>
                <AuthorName>
                  {comment.authorInfo.displayName}
                  {comment.authorInfo.isVerified && <VerifiedBadge>✓</VerifiedBadge>}
                </AuthorName>
                <CommentMeta>
                  {formatDate(comment.createdAt)}
                  {comment.isEdited && (
                    <EditedTag> • {language === 'bg' ? 'Редактиран' : 'Edited'}</EditedTag>
                  )}
                </CommentMeta>
              </AuthorDetails>
            </AuthorInfo>
            
            {currentUser && currentUser.uid === comment.authorId && !comment.isDeleted && (
              <CommentActions>
                <ActionButton onClick={() => {
                  setEditingComment(comment.id);
                  setEditContent(comment.content);
                }}>
                  <Edit size={14} />
                </ActionButton>
                <ActionButton onClick={() => handleDelete(comment.id)}>
                  <Trash2 size={14} />
                </ActionButton>
              </CommentActions>
            )}
          </CommentHeader>

          {editingComment === comment.id ? (
            <EditForm>
              <EditTextarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <EditActions>
                <SaveButton onClick={() => handleEdit(comment.id)}>
                  {language === 'bg' ? 'Запази' : 'Save'}
                </SaveButton>
                <CancelButton onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}>
                  {language === 'bg' ? 'Откажи' : 'Cancel'}
                </CancelButton>
              </EditActions>
            </EditForm>
          ) : (
            <>
              <CommentContent $isDeleted={comment.isDeleted}>
                {comment.content}
              </CommentContent>

              {!comment.isDeleted && (
                <CommentFooter>
                  <LikeButton
                    onClick={() => handleLike(comment.id)}
                    $isLiked={comment.likedBy?.includes(currentUser?.uid || '')}
                  >
                    <Heart size={14} />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </LikeButton>
                  
                  <ReplyButton onClick={() => setShowReplyForm(
                    showReplyForm === comment.id ? null : comment.id
                  )}>
                    <MessageCircle size={14} />
                    {language === 'bg' ? 'Отговори' : 'Reply'}
                  </ReplyButton>
                </CommentFooter>
              )}
            </>
          )}
        </CommentItem>
      ))}
    </CommentsContainer>
  );
};

// Styled Components
const CommentsContainer = styled.div`
  padding: 16px 0;
`;

const CommentItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const AuthorInfo = styled.div`
  display: flex;
  gap: 10px;
`;

const AuthorAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const VerifiedBadge = styled.span`
  color: #1da1f2;
  font-size: 12px;
`;

const CommentMeta = styled.div`
  font-size: 12px;
  color: #666;
`;

const EditedTag = styled.span`
  color: #999;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #666;
  border-radius: 4px;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const CommentContent = styled.p<{ $isDeleted?: boolean }>`
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.$isDeleted ? '#999' : '#1a1a1a'};
  font-style: ${props => props.$isDeleted ? 'italic' : 'normal'};
`;

const CommentFooter = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const LikeButton = styled.button<{ $isLiked?: boolean }>`
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$isLiked ? '#e74c3c' : '#666'};
  border-radius: 4px;

  svg {
    fill: ${props => props.$isLiked ? '#e74c3c' : 'none'};
  }

  &:hover {
    background: #f0f0f0;
  }
`;

const ReplyButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  border-radius: 4px;

  &:hover {
    background: #f0f0f0;
  }
`;

const EditForm = styled.div`
  margin: 8px 0;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #003366;
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const SaveButton = styled.button`
  padding: 6px 16px;
  background: #003366;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #002244;
  }
`;

const CancelButton = styled.button`
  padding: 6px 16px;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #d0d0d0;
  }
`;

const LoadingContainer = styled.div`
  padding: 24px;
  text-align: center;
  color: #666;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

export default PostComments;
