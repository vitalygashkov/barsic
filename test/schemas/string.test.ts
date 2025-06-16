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
