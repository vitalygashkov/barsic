import { expect, test } from 'vitest';
import { b } from '../../lib';

test('Bytes with fixed length', () => {
  const fixedBytes = b.bytes(3);
  const data = new Uint8Array([1, 2, 3]);
  expect(fixedBytes.parse(data)).toEqual(data);
  expect(fixedBytes.build(data)).toEqual(data);
  expect(() => fixedBytes.build(new Uint8Array([1, 2]))).toThrow('Bytes length mismatch');
});

test('Bytes with dynamic length', () => {
  const dynamicBytes = b.bytes((ctx) => ctx.length);
  const input = new Uint8Array([0x00, 0x04, 1, 2, 3, 4]);
  const expectedData = new Uint8Array([1, 2, 3, 4]);

  const result = b
    .object({
      length: b.uint16(),
      data: dynamicBytes,
    })
    .parse(input);

  expect(result).toEqual({
    length: 4,
    data: expectedData,
  });
});

test('Bytes should build and parse symmetrically', () => {
  // Arrange
  const parser = b.bytes(4);
  const obj = new Uint8Array([1, 2, 3, 4]);
  const expectedBytes = new Uint8Array([1, 2, 3, 4]);

  // Act: Build
  const built = parser.build(obj);

  // Assert: Build
  expect(built).toEqual(expectedBytes);

  // Act & Assert: Parse (Symmetry)
  const parsed = parser.parse(built);
  expect(parsed).toEqual(obj);
});
