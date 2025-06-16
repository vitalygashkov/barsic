import { expect, test } from 'vitest';
import { b } from '../../lib';

test('uint16 parses and builds correctly', () => {
  const value = 0x1234;
  const buffer = new Uint8Array([0x12, 0x34]);
  expect(b.uint16().parse(buffer)).toBe(value);
  expect(b.uint16().build(value)).toEqual(buffer);
});
