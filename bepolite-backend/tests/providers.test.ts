import { describe, it, expect } from 'vitest';
import { ProviderSelectionService } from '../src/modules/providers/providerSelection.js';

const selectionService = new ProviderSelectionService();

describe('Provider Selection Algorithm', () => {
  it('should calculate distance between two coordinates', () => {
    // New York to Los Angeles (approximate)
    const distance = selectionService['calculateDistance'](40.7128, -74.006, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(3900);
    expect(distance).toBeLessThan(4000);
  });

  it('should calculate provider score', () => {
    const ranking = {
      deviceId: 'test-device',
      userId: 'test-user',
      distance: 1,
      estimatedSpeed: 50,
      batteryLevel: 80,
      trustScore: 90,
    };

    const score = selectionService['calculateScore'](ranking);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should prioritize speed and battery', () => {
    const highScore = selectionService['calculateScore']({
      deviceId: 'high-device',
      userId: 'user1',
      distance: 1,
      estimatedSpeed: 100,
      batteryLevel: 100,
      trustScore: 50,
    });

    const lowScore = selectionService['calculateScore']({
      deviceId: 'low-device',
      userId: 'user2',
      distance: 1,
      estimatedSpeed: 10,
      batteryLevel: 20,
      trustScore: 50,
    });

    expect(highScore).toBeGreaterThan(lowScore);
  });
});
