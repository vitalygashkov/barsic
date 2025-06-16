import { expect, test } from 'vitest';
import { b } from '../../lib';

test('Literal validates constant values', () => {
  const magic = b.literal(new Uint8Array([0x4d, 0x5a]));
  const invalidData = new Uint8Array([0x41, 0x42]);
  expect(() => magic.parse(invalidData)).toThrow('Literal mismatch');
});

test('Literal should build and parse symmetrically', () => {
  // Arrange
  const constantBytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
  const parser = b.literal(constantBytes);
  const obj = constantBytes; // The object to build is the constant itself

  // Act: Build
  const built = parser.build(obj);

  // Assert: Build
  expect(built).toEqual(constantBytes);

  // Act & Assert: Parse (Symmetry)
  const parsed = parser.parse(built);
  expect(parsed).toEqual(obj);

  // Sad Path: Assert that building with the wrong value throws an error
  const wrongBytes = new Uint8Array([1, 2, 3, 4]);
  expect(() => parser.build(wrongBytes)).toThrow('Const build mismatch');
});
