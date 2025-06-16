import { expect, test } from 'vitest';
import { b } from '../../lib';

test('Sized should build and parse symmetrically', () => {
  // Arrange
  const parser = b.sized(
    b.object({
      total_length: b.uint32(),
      data: b.uint32(),
    }),
    (item) => item.total_length
  );
  const obj = { total_length: 12, data: 1234 };
  const expectedBytes = new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x0c, // total_length = 12
    0x00,
    0x00,
    0x04,
    0xd2, // data = 1234
    0x00,
    0x00,
    0x00,
    0x00, // 4 bytes of padding
  ]);

  // Act: Build
  const built = parser.build(obj);

  // Assert: Build
  expect(built).toEqual(expectedBytes);

  // Act & Assert: Parse (Symmetry)
  const parsed = parser.parse(built);
  expect(parsed).toEqual(obj);
});

test('should correctly parse a sized item when used correctly', () => {
  const PaddedItem = b.sized(b.object({ total_length: b.uint32(), data: b.uint32() }), (item) => item.total_length);
  const result = PaddedItem.parse(new Uint8Array([0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x16, 0x2e]));
  expect(result).toEqual({ total_length: 8, data: 5678 });
});

test('should throw a helpful error if arguments are swapped', () => {
  const MyStruct = b.object({ total_length: b.uint32(), data: b.uint32() });
  const myLengthFunc = (item: any) => item.total_length;

  // We expect this to throw because the first argument is a function, not a construct.
  const action = () => b.sized(myLengthFunc as any, MyStruct as any);

  expect(action).toThrow(
    'Sized: Invalid sub-construct provided. The first argument must be a valid construct object (e.g., Struct, Bytes).'
  );
});

test('should throw a helpful error if the length function is not a function', () => {
  const MyStruct = b.object({ total_length: b.uint32(), data: b.uint32() });

  // We expect this to throw because the second argument is an object, not a function.
  const action = () => b.sized(MyStruct, { not: 'a function' } as any);

  expect(action).toThrow(
    'Sized: Invalid length function provided. The second argument must be a function that returns a number.'
  );
});

test('sized with greedy-range should correctly parse items with padding by respecting the item length', () => {
  const PaddedItem = b.sized(
    b.object({
      total_length: b.uint32(),
      data: b.uint32(),
    }),
    (item) => item.total_length // The function now receives the parsed item
  );

  const PaddedListParser = b.greedyRange(PaddedItem);

  const binaryData = new Uint8Array([
    // Item 1 (12 bytes total)
    0x00,
    0x00,
    0x00,
    0x0c, // total_length = 12
    0x00,
    0x00,
    0x04,
    0xd2, // data = 1234
    0xff,
    0xff,
    0xff,
    0xff, // 4 bytes of padding
    // Item 2 (8 bytes total)
    0x00,
    0x00,
    0x00,
    0x08, // total_length = 8
    0x00,
    0x00,
    0x16,
    0x2e, // data = 5678
  ]);

  const result = PaddedListParser.parse(binaryData, true);

  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({ total_length: 12, data: 1234 });
  expect(result[1]).toEqual({ total_length: 8, data: 5678 });
});
