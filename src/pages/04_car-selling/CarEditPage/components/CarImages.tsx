import React, { useRef } from 'react';
import {
    Card, SectionTitle, ImageSection, MainImageContainer, MainImage, ImageNavButton,
    ThumbnailGrid, Thumbnail, AddImageButton, RemoveImageButton, LoadingSpinner
} from '../styles';
import { ChevronLeft, ChevronRight, Plus, Trash2, Upload } from 'lucide-react';

interface CarImagesProps {
    images: (string | File)[];
    selectedImageIndex: number;
    setSelectedImageIndex: (index: number) => void;
    uploadingImage: boolean;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveImage: (index: number) => void;
    previewUrlsRef: React.MutableRefObject<Map<number, string>>;
    t: any;
    isDark: boolean;
}

export const CarImages: React.FC<CarImagesProps> = ({
    images,
    selectedImageIndex,
    setSelectedImageIndex,
    uploadingImage,
    handleImageUpload,
    handleRemoveImage,
    previewUrlsRef,
    t,
    isDark
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getImageUrl = (image: string | File, index: number) => {
        if (typeof image === 'string') return image;
        return previewUrlsRef.current.get(index) || '';
    };

    const currentImageUrl = images.length > 0 ? getImageUrl(images[selectedImageIndex], selectedImageIndex) : null;

    return (
        <Card $isDark={isDark}>
            <SectionTitle $isDark={isDark}>{t.sections.images}</SectionTitle>
            <ImageSection $isDark={isDark}>
                <MainImageContainer $isDark={isDark}>
                    {currentImageUrl ? (
                        <>
                            <MainImage src={currentImageUrl} alt="Car Preview" />
                            {images.length > 1 && (
                                <>
                                    <ImageNavButton $isDark={isDark} $position="left" onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)}>
                                        <ChevronLeft size={24} />
                                    </ImageNavButton>
                                    <ImageNavButton $isDark={isDark} $position="right" onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % images.length)}>
                                        <ChevronRight size={24} />
                                    </ImageNavButton>
                                </>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '4rem', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <Upload size={48} />
                            <p>{t.placeholders.noImages}</p>
                        </div>
                    )}
                </MainImageContainer>

                <ThumbnailGrid $isDark={isDark}>
                    {images.map((img, index) => (
                        <Thumbnail
                            key={index}
                            $isDark={isDark}
                            $isActive={index === selectedImageIndex}
                            onClick={() => setSelectedImageIndex(index)}
                        >
                            <img src={getImageUrl(img, index)} alt={`Thumbnail ${index + 1}`} />
                            <RemoveImageButton $isDark={isDark} onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}>
                                <Trash2 size={14} />
                            </RemoveImageButton>
                        </Thumbnail>
                    ))}

                    <AddImageButton $isDark={isDark} onClick={() => fileInputRef.current?.click()}>
                        {uploadingImage ? <LoadingSpinner /> : <Plus size={24} />}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            accept="image/*"
                            multiple
                        />
                    </AddImageButton>
                </ThumbnailGrid>
            </ImageSection>
        </Card>
    );
};
