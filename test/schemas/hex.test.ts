import { expect, test } from 'vitest';
import { b } from '../../lib';

test('hex parses and builds correctly', () => {
  const expectedHex = '74657374';
  const expectedBuffer = new Uint8Array([116, 101, 115, 116]);
  const hex = b.hex().parse(expectedBuffer);
  expect(hex).toBe(expectedHex);
  const buffer = b.hex().build(hex);
  expect(buffer).toEqual(new Uint8Array([116, 101, 115, 116]));
});
