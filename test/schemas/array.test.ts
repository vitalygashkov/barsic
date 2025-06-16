import { expect, test } from 'vitest';
import { b } from '../../lib';

test('Array should build and parse symmetrically', () => {
  // Arrange
  const parser = b.array(b.uint16(), 3);
  const obj = [10, 20, 30];
  const expectedBytes = new Uint8Array([0x00, 0x0a, 0x00, 0x14, 0x00, 0x1e]);

  // Act: Build
  const built = parser.build(obj);

  // Assert: Build
  expect(built).toEqual(expectedBytes);

  // Act & Assert: Parse (Symmetry)
  const parsed = parser.parse(built);
  expect(parsed).toEqual(obj);

  // Sad Path: Assert that building with the wrong length throws
  expect(() => parser.build([1, 2])).toThrow('List length mismatch');
});

test('Array with fixed count', () => {
  const array = b.array(b.uint16(), 3);
  const data = new Uint8Array([0x00, 0x01, 0x00, 0x02, 0x00, 0x03]);
  const expected = [1, 2, 3];

  expect(array.parse(data)).toEqual(expected);
  expect(array.build(expected)).toEqual(data);
  expect(() => array.build([1, 2])).toThrow('List length mismatch');
});

test('Array with dynamic count', () => {
  const list = b.array(b.uint16(), (ctx) => ctx.count);
  const structure = b.object({
    count: b.uint16(),
    values: list,
  });

  const data = new Uint8Array([
    0x00,
    0x03, // count: 3
    0x00,
    0x01, // value 1
    0x00,
    0x02, // value 2
    0x00,
    0x03, // value 3
  ]);

  const obj = {
    count: 3,
    values: [1, 2, 3],
  };

  expect(structure.parse(data)).toEqual(obj);
  expect(structure.build(obj)).toEqual(data);
});
