import { expect, test } from 'vitest';
import { b } from '../../lib';

test('string parses and builds correctly', () => {
  const expectedString = 'test';
  const expectedBuffer = new Uint8Array([116, 101, 115, 116]);
  const string = b.string().parse(expectedBuffer);
  expect(string).toBe(expectedString);
  const buffer = b.string().build(string);
  expect(buffer).toEqual(new Uint8Array([116, 101, 115, 116]));
});

test('base64 parses and builds correctly', () => {
  const expectedBase64 = 'dGVzdA==';
  const expectedBuffer = new Uint8Array([116, 101, 115, 116]);
  const base64 = b.base64().parse(expectedBuffer);
  expect(base64).toBe(expectedBase64);
  const buffer = b.base64().build(base64);
  expect(buffer).toEqual(new Uint8Array([116, 101, 115, 116]));
});

test('hex parses and builds correctly', () => {
  const expectedHex = '74657374';
  const expectedBuffer = new Uint8Array([116, 101, 115, 116]);
  const hex = b.hex().parse(expectedBuffer);
  expect(hex).toBe(expectedHex);
  const buffer = b.hex().build(hex);
  expect(buffer).toEqual(new Uint8Array([116, 101, 115, 116]));
});
