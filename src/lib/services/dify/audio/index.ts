/**
 * @fileoverview Audio service for Dify API - handles speech-to-text and text-to-audio
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { BaseDifyService } from '../base';
import {
  SpeechToTextResponse,
  TextToAudioRequest,
  TextToAudioResponse,
  DifyApiResponse,
} from '../types';

/**
 * Service for handling audio operations with Dify API
 * Provides speech-to-text and text-to-audio capabilities
 */
export class AudioService extends BaseDifyService {
  /**
   * Converts audio file to text using speech-to-text
   * @param audioFile - Audio file to convert (mp3, mp4, mpeg, mpga, m4a, wav, webm)
   * @returns Promise resolving to transcribed text
   * @example
   * ```typescript
   * const audioFile = new File([audioData], 'recording.wav', { type: 'audio/wav' });
   * const result = await audioService.speechToText(audioFile);
   *
   * if (result.success) {
   *   console.log("Transcribed text:", result.data?.text);
   * }
   * ```
   */
  async speechToText(audioFile: File): Promise<DifyApiResponse<SpeechToTextResponse>> {
    try {
      this.validateRequired({ audioFile }, ['audioFile']);

      // Validate file size (15MB limit)
      const maxSize = 15 * 1024 * 1024; // 15MB in bytes
      if (audioFile.size > maxSize) {
        throw new Error(`File size exceeds 15MB limit. Current size: ${audioFile.size} bytes`);
      }

      // Validate file type
      const allowedTypes = [
        'audio/mp3',
        'audio/mp4',
        'audio/mpeg',
        'audio/mpga',
        'audio/m4a',
        'audio/wav',
        'audio/webm',
      ];
      if (!allowedTypes.includes(audioFile.type)) {
        throw new Error(
          `Unsupported file type: ${audioFile.type}. Supported types: ${allowedTypes.join(', ')}`
        );
      }

      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('user', this.userId);

      const response = await this.makeMultipartRequest('/audio-to-text', formData);
      const data: SpeechToTextResponse = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Converts text to audio using text-to-speech
   * @param text - Text to convert to speech
   * @param messageId - Optional message ID to use existing message content
   * @returns Promise resolving to audio blob
   * @example
   * ```typescript
   * // Convert text to audio
   * const result = await audioService.textToAudio("Hello, how are you today?");
   *
   * if (result.success && result.data) {
   *   const audioUrl = URL.createObjectURL(result.data);
   *   const audio = new Audio(audioUrl);
   *   audio.play();
   * }
   * ```
   */
  async textToAudio(
    text?: string,
    messageId?: string
  ): Promise<DifyApiResponse<TextToAudioResponse>> {
    try {
      // Validate that either text or messageId is provided
      if (!text && !messageId) {
        throw new Error('Either text or messageId must be provided');
      }

      const request: TextToAudioRequest = {
        user: this.userId,
        ...(text && { text }),
        ...(messageId && { message_id: messageId }),
      };

      const response = await this.makeRequest('/text-to-audio', {
        method: 'POST',
        headers: {
          Accept: 'audio/wav',
        },
        body: JSON.stringify(request),
      });

      const audioBlob: Blob = await response.blob();

      return {
        success: true,
        data: audioBlob,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Converts a message to audio using its message ID
   * @param messageId - ID of the message to convert to audio
   * @returns Promise resolving to audio blob
   * @example
   * ```typescript
   * const result = await audioService.messageToAudio("msg-123");
   *
   * if (result.success && result.data) {
   *   // Play the audio
   *   const audioUrl = URL.createObjectURL(result.data);
   *   const audio = new Audio(audioUrl);
   *   audio.play();
   * }
   * ```
   */
  async messageToAudio(messageId: string): Promise<DifyApiResponse<TextToAudioResponse>> {
    try {
      this.validateRequired({ messageId }, ['messageId']);
      return this.textToAudio(undefined, messageId);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Converts text to audio and returns a playable URL
   * @param text - Text to convert to speech
   * @returns Promise resolving to audio URL
   * @example
   * ```typescript
   * const audioUrl = await audioService.textToAudioUrl("Hello world!");
   *
   * if (audioUrl) {
   *   const audio = new Audio(audioUrl);
   *   audio.play();
   * }
   * ```
   */
  async textToAudioUrl(text: string): Promise<string | null> {
    try {
      const result = await this.textToAudio(text);

      if (result.success && result.data) {
        return URL.createObjectURL(result.data);
      }

      return null;
    } catch (error) {
      console.error('Error converting text to audio URL:', error);
      return null;
    }
  }

  /**
   * Converts a message to audio and returns a playable URL
   * @param messageId - ID of the message to convert
   * @returns Promise resolving to audio URL
   * @example
   * ```typescript
   * const audioUrl = await audioService.messageToAudioUrl("msg-123");
   *
   * if (audioUrl) {
   *   const audio = new Audio(audioUrl);
   *   audio.play();
   * }
   * ```
   */
  async messageToAudioUrl(messageId: string): Promise<string | null> {
    try {
      const result = await this.messageToAudio(messageId);

      if (result.success && result.data) {
        return URL.createObjectURL(result.data);
      }

      return null;
    } catch (error) {
      console.error('Error converting message to audio URL:', error);
      return null;
    }
  }

  /**
   * Validates audio file before processing
   * @param file - Audio file to validate
   * @returns Validation result with error message if invalid
   * @example
   * ```typescript
   * const validation = audioService.validateAudioFile(audioFile);
   *
   * if (!validation.isValid) {
   *   console.error("File validation failed:", validation.error);
   * }
   * ```
   */
  validateAudioFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (15MB limit)
    const maxSize = 15 * 1024 * 1024; // 15MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds 15MB limit. Current size: ${file.size} bytes`,
      };
    }

    // Check file type
    const allowedTypes = [
      'audio/mp3',
      'audio/mp4',
      'audio/mpeg',
      'audio/mpga',
      'audio/m4a',
      'audio/wav',
      'audio/webm',
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}. Supported types: ${allowedTypes.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Gets supported audio formats for speech-to-text
   * @returns Array of supported MIME types
   * @example
   * ```typescript
   * const formats = audioService.getSupportedFormats();
   * console.log("Supported formats:", formats);
   * ```
   */
  getSupportedFormats(): string[] {
    return [
      'audio/mp3',
      'audio/mp4',
      'audio/mpeg',
      'audio/mpga',
      'audio/m4a',
      'audio/wav',
      'audio/webm',
    ];
  }

  /**
   * Gets maximum file size for audio uploads
   * @returns Maximum file size in bytes
   * @example
   * ```typescript
   * const maxSize = audioService.getMaxFileSize();
   * console.log(`Maximum file size: ${maxSize / (1024 * 1024)}MB`);
   * ```
   */
  getMaxFileSize(): number {
    return 15 * 1024 * 1024; // 15MB in bytes
  }
}
