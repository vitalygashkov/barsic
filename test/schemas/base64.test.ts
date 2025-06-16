import { expect, test } from 'vitest';
import { b } from '../../lib';

test('base64 parses and builds correctly', () => {
  const expectedBase64 = 'dGVzdA==';
  const expectedBuffer = new Uint8Array([116, 101, 115, 116]);
  const base64 = b.base64().parse(expectedBuffer);
  expect(base64).toBe(expectedBase64);
  const buffer = b.base64().build(base64);
  expect(buffer).toEqual(new Uint8Array([116, 101, 115, 116]));
});
