import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateVideoDuration,
  validateVideoSize,
  validateVideoFormat,
  validateVideo,
  VIDEO_CONSTRAINTS,
} from '../utils/videoValidation';

describe('videoValidation', () => {
  describe('validateVideoFormat', () => {
    it('should accept MP4 format', () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      const result = validateVideoFormat(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept MOV format', () => {
      const file = new File([''], 'test.mov', { type: 'video/quicktime' });
      const result = validateVideoFormat(file);
      expect(result.isValid).toBe(true);
    });

    it('should accept AVI format', () => {
      const file = new File([''], 'test.avi', { type: 'video/x-msvideo' });
      const result = validateVideoFormat(file);
      expect(result.isValid).toBe(true);
    });

    it('should accept file with valid extension even if MIME type is missing', () => {
      const file = new File([''], 'test.mp4', { type: '' });
      const result = validateVideoFormat(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid format', () => {
      const file = new File([''], 'test.webm', { type: 'video/webm' });
      const result = validateVideoFormat(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid video format. Use MP4, MOV, or AVI');
    });

    it('should reject non-video files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = validateVideoFormat(file);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateVideoSize', () => {
    it('should accept video under 20MB', () => {
      const size = 10 * 1024 * 1024; // 10MB
      const file = new File([new ArrayBuffer(size)], 'test.mp4', { type: 'video/mp4' });
      const result = validateVideoSize(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept video exactly at 20MB', () => {
      const size = VIDEO_CONSTRAINTS.MAX_SIZE_BYTES;
      const file = new File([new ArrayBuffer(size)], 'test.mp4', { type: 'video/mp4' });
      const result = validateVideoSize(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject video over 20MB', () => {
      const size = 25 * 1024 * 1024; // 25MB
      const file = new File([new ArrayBuffer(size)], 'test.mp4', { type: 'video/mp4' });
      const result = validateVideoSize(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be 20MB or less');
      expect(result.error).toContain('25.00MB');
    });

    it('should accept small video files', () => {
      const size = 1024 * 1024; // 1MB
      const file = new File([new ArrayBuffer(size)], 'test.mp4', { type: 'video/mp4' });
      const result = validateVideoSize(file);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateVideoDuration', () => {
    let mockVideo: any;

    beforeEach(() => {
      // Mock HTMLVideoElement
      mockVideo = {
        duration: 0,
        preload: '',
        src: '',
        onloadedmetadata: null,
        onerror: null,
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockVideo as any);
      
      // Mock URL methods on global object
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();
    });

    it('should accept video under 10 seconds', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      
      const validationPromise = validateVideoDuration(file);
      
      // Simulate video metadata loaded with 5 second duration
      mockVideo.duration = 5;
      mockVideo.onloadedmetadata();

      const result = await validationPromise;
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept video exactly at 10 seconds', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      
      const validationPromise = validateVideoDuration(file);
      
      mockVideo.duration = 10;
      mockVideo.onloadedmetadata();

      const result = await validationPromise;
      expect(result.isValid).toBe(true);
    });

    it('should reject video over 10 seconds', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      
      const validationPromise = validateVideoDuration(file);
      
      mockVideo.duration = 15;
      mockVideo.onloadedmetadata();

      const result = await validationPromise;
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be 10 seconds or less');
      expect(result.error).toContain('15s');
    });

    it('should handle video metadata read errors', async () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      
      const validationPromise = validateVideoDuration(file);
      
      mockVideo.onerror();

      const result = await validationPromise;
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Could not read video metadata');
    });
  });

  describe('validateVideo', () => {
    let mockVideo: any;

    beforeEach(() => {
      mockVideo = {
        duration: 0,
        preload: '',
        src: '',
        onloadedmetadata: null,
        onerror: null,
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockVideo as any);
      
      // Mock URL methods on global object
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();
    });

    it('should accept valid video (format, size, duration)', async () => {
      const size = 10 * 1024 * 1024; // 10MB
      const file = new File([new ArrayBuffer(size)], 'test.mp4', { type: 'video/mp4' });
      
      const validationPromise = validateVideo(file);
      
      mockVideo.duration = 8;
      mockVideo.onloadedmetadata();

      const result = await validationPromise;
      expect(result.isValid).toBe(true);
    });

    it('should reject video with invalid format first', async () => {
      const size = 10 * 1024 * 1024;
      const file = new File([new ArrayBuffer(size)], 'test.webm', { type: 'video/webm' });
      
      const result = await validateVideo(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid video format');
    });

    it('should reject video with invalid size', async () => {
      const size = 25 * 1024 * 1024; // 25MB
      const file = new File([new ArrayBuffer(size)], 'test.mp4', { type: 'video/mp4' });
      
      const result = await validateVideo(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be 20MB or less');
    });

    it('should reject video with invalid duration', async () => {
      const size = 10 * 1024 * 1024;
      const file = new File([new ArrayBuffer(size)], 'test.mp4', { type: 'video/mp4' });
      
      const validationPromise = validateVideo(file);
      
      mockVideo.duration = 15;
      mockVideo.onloadedmetadata();

      const result = await validationPromise;
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be 10 seconds or less');
    });
  });
});
