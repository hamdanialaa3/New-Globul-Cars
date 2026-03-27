// Text Editor - Rich text input for posts
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React from 'react';
import styled from 'styled-components';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
}

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  placeholder,
  maxLength
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <EditorContainer>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {value.length > 0 && (
        <HashtagsHint>
          Use # for hashtags, @ for mentions
        </HashtagsHint>
      )}
    </EditorContainer>
  );
};

const EditorContainer = styled.div`
  position: relative;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  max-height: 300px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    background: white;
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #adb5bd;
    font-size: 0.9rem;
  }
`;

const HashtagsHint = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 8px;
  padding-left: 4px;
  font-style: italic;
`;

export default TextEditor;



