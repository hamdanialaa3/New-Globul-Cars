// Media Uploader - Upload images/videos for posts
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useRef } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Image, Video, X } from 'lucide-react';

interface MediaUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles: number;
  maxSize: number;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  files,
  onChange,
  maxFiles,
  maxSize
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(file => file.size <= maxSize);
    const newFiles = [...files, ...valid].slice(0, maxFiles);
    onChange(newFiles);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <Container>
      {files.length > 0 && (
        <PreviewGrid>
          {files.map((file, index) => (
            <PreviewItem key={index}>
              <Preview src={URL.createObjectURL(file)} alt="" />
              <RemoveButton onClick={() => removeFile(index)}>
                <X size={16} />
              </RemoveButton>
            </PreviewItem>
          ))}
        </PreviewGrid>
      )}

      {files.length < maxFiles && (
        <UploadButton onClick={() => fileInputRef.current?.click()}>
          {files.some(f => f.type.startsWith('video')) ? (
            <Video size={20} />
          ) : (
            <Image size={20} />
          )}
          <span>
            {language === 'bg' ? 'Добави медия' : 'Add Media'} 
            ({files.length}/{maxFiles})
          </span>
        </UploadButton>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
`;

const PreviewItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Preview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 0, 0, 1);
    transform: scale(1.1);
  }
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px dashed #dee2e6;
  border-radius: 10px;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #FF8F10;
    color: #FF7900;
    background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.2);
  }
`;

export default MediaUploader;

