/**
 * @fileoverview Tests for main Dify service facade
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DifyService } from '../index';

// Mock the individual services
vi.mock('../chat', () => ({
  ChatService: vi.fn().mockImplementation(() => ({
    makeRequest: vi.fn(),
  })),
}));

vi.mock('../conversation', () => ({
  ConversationService: vi.fn().mockImplementation(() => ({
    makeRequest: vi.fn(),
  })),
}));

vi.mock('../feedback', () => ({
  FeedbackService: vi.fn().mockImplementation(() => ({
    makeRequest: vi.fn(),
  })),
}));

vi.mock('../suggestions', () => ({
  SuggestionsService: vi.fn().mockImplementation(() => ({
    makeRequest: vi.fn(),
  })),
}));

vi.mock('../audio', () => ({
  AudioService: vi.fn().mockImplementation(() => ({
    makeRequest: vi.fn(),
  })),
}));

vi.mock('../files', () => ({
  FileService: vi.fn().mockImplementation(() => ({
    makeRequest: vi.fn(),
  })),
}));

describe('DifyService', () => {
  const mockConfig = {
    apiKey: 'app-test-api-key',
    userId: 'test-user-123',
    baseUrl: 'https://api.dify.ai/v1',
    timeout: 30000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with valid configuration', () => {
      const service = new DifyService(mockConfig);

      expect(service).toBeInstanceOf(DifyService);
      expect(service.getUserId()).toBe('test-user-123');
      expect(service.getApiKey()).toBe('app-test...');
      expect(service.getBaseUrl()).toBe('https://api.dify.ai/v1');
      expect(service.getTimeout()).toBe(30000);
    });

    it('should throw error when API key is missing', () => {
      expect(() => {
        new DifyService({ ...mockConfig, apiKey: '' });
      }).toThrow('API key is required');
    });

    it('should throw error when user ID is missing', () => {
      expect(() => {
        new DifyService({ ...mockConfig, userId: '' });
      }).toThrow('User ID is required');
    });

    it('should use default values for optional configuration', () => {
      const minimalConfig = {
        apiKey: 'app-test-api-key',
        userId: 'test-user-123',
      };

      const service = new DifyService(minimalConfig);

      expect(service.getBaseUrl()).toBe('https://api.dify.ai/v1');
      expect(service.getTimeout()).toBe(30000);
    });
  });

  describe('getter methods', () => {
    let service: DifyService;

    beforeEach(() => {
      service = new DifyService(mockConfig);
    });

    it('should return user ID', () => {
      expect(service.getUserId()).toBe('test-user-123');
    });

    it('should return masked API key', () => {
      expect(service.getApiKey()).toBe('app-test...');
    });

    it('should return base URL', () => {
      expect(service.getBaseUrl()).toBe('https://api.dify.ai/v1');
    });

    it('should return timeout', () => {
      expect(service.getTimeout()).toBe(30000);
    });
  });

  describe('updateUserId', () => {
    it('should update user ID in all services', () => {
      const freshConfig = { ...mockConfig };
      const service = new DifyService(freshConfig);

      service.updateUserId('new-user-456');

      expect(service.getUserId()).toBe('new-user-456');
    });
  });

  describe('forUser', () => {
    it('should create new service instance with different user ID', () => {
      const service = new DifyService(mockConfig);
      const newService = service.forUser('different-user-789');

      expect(newService).toBeInstanceOf(DifyService);
      expect(newService.getUserId()).toBe('different-user-789');
      expect(newService.getApiKey()).toBe('app-test...');
      expect(newService.getBaseUrl()).toBe('https://api.dify.ai/v1');
    });
  });

  describe('withApiKey', () => {
    it('should create new service instance with different API key', () => {
      const freshConfig = { ...mockConfig };
      const service = new DifyService(freshConfig);
      const newService = service.withApiKey('app-different-key');

      expect(newService).toBeInstanceOf(DifyService);
      expect(newService.getUserId()).toBe('test-user-123');
      expect(newService.getApiKey()).toBe('app-diff...');
    });
  });

  describe('getHealth', () => {
    it('should return healthy status when all services work', async () => {
      const service = new DifyService(mockConfig);

      // Mock successful requests
      const mockMakeRequest = vi.fn().mockResolvedValue({});
      (service.chat as any).makeRequest = mockMakeRequest;
      (service.conversation as any).makeRequest = mockMakeRequest;
      (service.files as any).makeRequest = mockMakeRequest;

      const health = await service.getHealth();

      expect(health.isHealthy).toBe(true);
      expect(health.issues).toHaveLength(0);
      expect(health.services.chat).toBe(true);
      expect(health.services.conversation).toBe(true);
      expect(health.services.files).toBe(true);
    });

    it('should return unhealthy status when services fail', async () => {
      const service = new DifyService(mockConfig);

      // Mock failed requests
      const mockMakeRequest = vi.fn().mockRejectedValue(new Error('Service unavailable'));
      (service.chat as any).makeRequest = mockMakeRequest;
      (service.conversation as any).makeRequest = mockMakeRequest;
      (service.files as any).makeRequest = mockMakeRequest;

      const health = await service.getHealth();

      expect(health.isHealthy).toBe(false);
      expect(health.issues.length).toBeGreaterThan(0);
      expect(health.services.chat).toBe(false);
      expect(health.services.conversation).toBe(false);
      expect(health.services.files).toBe(false);
    });
  });

  describe('service initialization', () => {
    it('should initialize all service instances', () => {
      const service = new DifyService(mockConfig);

      expect(service.chat).toBeDefined();
      expect(service.conversation).toBeDefined();
      expect(service.feedback).toBeDefined();
      expect(service.suggestions).toBeDefined();
      expect(service.audio).toBeDefined();
      expect(service.files).toBeDefined();
    });
  });
});
