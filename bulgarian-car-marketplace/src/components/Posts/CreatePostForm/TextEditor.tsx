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
  z-index: 1;  /* ⚡ Fix: Lower than PostTypeSelector */
  margin-top: 8px;  /* ⚡ Add spacing from buttons above */
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 160px;
  max-height: 300px;
  padding: 14px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s;
  background: #fafafa;
  
  &:focus {
    outline: none;
    border-color: #FF8F10;
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const HashtagsHint = styled.div`
  font-size: 0.7rem;
  color: #6c757d;
  margin-top: 6px;
  padding-left: 2px;
`;

export default TextEditor;

