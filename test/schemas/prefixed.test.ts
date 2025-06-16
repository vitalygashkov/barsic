import { expect, test } from 'vitest';
import { b } from '../../lib';

test('Prefixed should build and parse symmetrically', () => {
  // Arrange
  const innerStruct = b.object({ a: b.uint16(), b: b.uint16() });
  // The length function is only used for parsing.
  const parser = b.prefixed((ctx) => 4, innerStruct);
  const obj = { a: 1, b: 2 };
  // The build method for our Prefixed just builds the inner content.
  const expectedBytes = new Uint8Array([0x00, 0x01, 0x00, 0x02]);

  // Act: Build
  const built = parser.build(obj);

  // Assert: Build
  expect(built).toEqual(expectedBytes);

  // Act & Assert: Parse (Symmetry)
  const parsed = parser.parse(built);
  expect(parsed).toEqual(obj);
});
