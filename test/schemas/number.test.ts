import { expect, test } from 'vitest';
import { b } from '../../lib';

test('uint16 parses and builds correctly', () => {
  const value = 0x1234;
  const buffer = new Uint8Array([0x12, 0x34]);
  expect(b.uint16().parse(buffer)).toBe(value);
  expect(b.uint16().build(value)).toEqual(buffer);
});

test('uint32 parses and builds correctly', () => {
  const value = 0x12345678;
  const buffer = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
  expect(b.uint32().parse(buffer)).toBe(value);
  expect(b.uint32().build(value)).toEqual(buffer);
});

test('uint32 should build and parse symmetrically', () => {
  // Arrange
  const parser = b.uint32();
  const obj = 123456789;
  const expectedBytes = new Uint8Array([0x07, 0x5b, 0xcd, 0x15]);

  // Act: Build
  const built = parser.build(obj);

  // Assert: Build
  expect(built).toEqual(expectedBytes);

  // Act & Assert: Parse (Symmetry)
  const parsed = parser.parse(built);
  expect(parsed).toEqual(obj);
});
