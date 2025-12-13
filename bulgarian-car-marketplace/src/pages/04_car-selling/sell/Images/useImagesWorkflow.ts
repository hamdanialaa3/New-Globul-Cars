import { useCallback, useEffect, useMemo, useState } from 'react';
import { WorkflowPersistenceService } from '../../../../services/unified-workflow-persistence.service';
import useSellWorkflow from '../../../../hooks/useSellWorkflow';
import { logger } from '../../../../services/logger-service';

const MAX_IMAGES = 20;

const filterFiles = (files: File[]) => {
  const uniqueMap = new Map<string, File>();
  files.forEach(file => {
    const key = `${file.name}-${file.size}-${file.type}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, file);
    }
  });
  return Array.from(uniqueMap.values()).slice(0, MAX_IMAGES);
};

export const useImagesWorkflow = () => {
  const { updateWorkflowData } = useSellWorkflow();
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load images from storage on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const savedImages = await WorkflowPersistenceService.getImagesAsFiles();
        if (savedImages.length > 0) {
          setFiles(savedImages);
        }
      } catch (error) {
        logger.warn('Failed to load images from storage', error as Error);
      }
    };
    loadImages();
  }, []);

  useEffect(() => {
    updateWorkflowData(
      {
        imagesCount: files.length,
        images: files.length ? String(files.length) : undefined
      },
      'images'
    );
  }, [files, updateWorkflowData]);

  useEffect(() => {
    const persistImages = async () => {
      try {
        if (files.length === 0) {
          WorkflowPersistenceService.clearImages();
          return;
        }
        await WorkflowPersistenceService.saveImages(files);
      } catch (error) {
        logger.warn('Failed to persist workflow images', error as Error);
      }
    };

    persistImages();
  }, [files]);

  const addFiles = useCallback((incoming: File[]) => {
    // Validate files before adding
    const validatedFiles = incoming.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        logger.warn('Invalid file type', { fileName: file.name, type: file.type });
        return false;
      }

      // Check file size (max 10MB per image)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        logger.warn('File too large', { fileName: file.name, size: file.size, maxSize });
        return false;
      }

      return true;
    });

    if (validatedFiles.length !== incoming.length) {
      logger.warn('Some files were filtered out during validation', {
        originalCount: incoming.length,
        validatedCount: validatedFiles.length
      });
    }

    setFiles(prev => filterFiles([...prev, ...validatedFiles]));
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  const saveImages = useCallback(async () => {
    if (!files.length) return;

    setIsSaving(true);
    try {
      await WorkflowPersistenceService.saveImages(files);
      logger.info('Images saved to WorkflowPersistenceService', { count: files.length });
    } finally {
      setIsSaving(false);
    }
  }, [files]);

  const hasImages = useMemo(() => files.length > 0, [files.length]);

  return {
    files,
    hasImages,
    isSaving,
    addFiles,
    removeFile,
    clearFiles,
    saveImages
  };
};

export default useImagesWorkflow;

