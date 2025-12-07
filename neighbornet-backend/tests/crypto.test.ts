import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, generateDeviceFingerprint, hash, createSignature, verifySignature } from '../src/utils/crypto';

describe('Crypto Utils', () => {
  it('should hash and compare passwords', async () => {
    const password = 'testpassword123';
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toBe(password);

    const isValid = await comparePassword(password, hashedPassword);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword('wrongpassword', hashedPassword);
    expect(isInvalid).toBe(false);
  });

  it('should generate unique device fingerprints', () => {
    const fp1 = generateDeviceFingerprint();
    const fp2 = generateDeviceFingerprint();

    expect(fp1).not.toBe(fp2);
    expect(fp1.length).toBe(64); // 32 bytes in hex
  });

  it('should hash data consistently', () => {
    const data = 'test-data';
    const hash1 = hash(data);
    const hash2 = hash(data);

    expect(hash1).toBe(hash2);
  });

  it('should sign and verify data', () => {
    const data = 'test-data';
    const secret = 'test-secret';

    const signature = createSignature(data, secret);
    const isValid = verifySignature(data, signature, secret);

    expect(isValid).toBe(true);

    const isInvalid = verifySignature('wrong-data', signature, secret);
    expect(isInvalid).toBe(false);
  });
});
