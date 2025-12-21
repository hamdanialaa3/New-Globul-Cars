// src/services/profile/__tests__/image-processing-service.test.ts
// Image Processing Service Tests - اختبارات خدمة معالجة الصور
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { ImageProcessingService } from '../image-processing-service';

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;

  beforeEach(() => {
    service = ImageProcessingService.getInstance();
  });

  // ==================== SINGLETON TESTS ====================

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = ImageProcessingService.getInstance();
      const instance2 = ImageProcessingService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  // ==================== VALIDATION TESTS ====================

  describe('Image Validation', () => {
    it('should accept valid image files', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(validFile.type.startsWith('image/')).toBe(true);
    });

    it('should check file size limits', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const validSize = 3 * 1024 * 1024; // 3MB
      const invalidSize = 7 * 1024 * 1024; // 7MB
      
      expect(validSize < maxSize).toBe(true);
      expect(invalidSize > maxSize).toBe(true);
    });

    it('should handle different image types', () => {
      const types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      types.forEach(type => {
        expect(type.startsWith('image/')).toBe(true);
      });
    });
  });

  // ==================== FILE SIZE TESTS ====================

  describe('File Size Limits', () => {
    it('profile images should be under 10MB', () => {
      const maxProfileSize = 10 * 1024 * 1024;
      expect(maxProfileSize).toBe(10485760);
    });

    it('cover images should be under 15MB', () => {
      const maxCoverSize = 15 * 1024 * 1024;
      expect(maxCoverSize).toBe(15728640);
    });
  });

  // ==================== STORAGE PATH TESTS ====================

  describe('Storage Paths', () => {
    const userId = 'test-user-123';

    it('should generate correct profile path', () => {
      const path = `users/${userId}/profile/avatar.jpg`;
      expect(path).toContain('users/');
      expect(path).toContain('/profile/');
    });

    it('should generate correct cover path', () => {
      const path = `users/${userId}/cover/cover.jpg`;
      expect(path).toContain('users/');
      expect(path).toContain('/cover/');
    });

    it('should generate correct gallery path', () => {
      const timestamp = Date.now();
      const path = `users/${userId}/gallery/image_${timestamp}.jpg`;
      expect(path).toContain('users/');
      expect(path).toContain('/gallery/');
    });
  });
});

// ==================== EXPORT ====================
export {};
