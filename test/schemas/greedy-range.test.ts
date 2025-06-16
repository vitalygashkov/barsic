import { expect, test } from 'vitest';
import { b } from '../../lib';

test('GreedyRange should build and parse symmetrically', () => {
  // Arrange
  const parser = b.greedyRange(b.uint16());
  const obj = [10, 20, 30];
  const expectedBytes = new Uint8Array([0x00, 0x0a, 0x00, 0x14, 0x00, 0x1e]);

  // Act: Build
  const built = parser.build(obj);

  // Assert: Build
  expect(built).toEqual(expectedBytes);

  // Act & Assert: Parse (Symmetry)
  const parsed = parser.parse(built);
  expect(parsed).toEqual(obj);
});

test('GreedyRange parses until end of data', () => {
  const range = b.greedyRange(b.uint16());
  const data = new Uint8Array([0x00, 0x01, 0x00, 0x02, 0x00, 0x03]);
  expect(range.parse(data)).toEqual([1, 2, 3]);
  expect(range.build([1, 2, 3])).toEqual(data);
});

// Define a sub-construct that can fail partway through.
// It reads 2 bytes of data, then expects a 2-byte signature.
const FailableItem = b.object({
  data: b.uint16(),
  signature: b.literal(new Uint8Array([0xaa, 0xbb])),
});

test('should parse a simple list of valid items correctly', () => {
  // HAPPY PATH TEST
  // Arrange
  const parser = b.greedyRange(FailableItem);
  const binaryData = new Uint8Array([
    // Item 1
    0x00, 0x01, 0xaa, 0xbb,
    // Item 2
    0x00, 0x02, 0xaa, 0xbb,
  ]);
  const expectedSignature = new Uint8Array([0xaa, 0xbb]);

  // Act
  const result = parser.parse(binaryData);

  // Assert
  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({ data: 1, signature: expectedSignature });
  expect(result[1]).toEqual({ data: 2, signature: expectedSignature });
});

test('should roll back the stream offset on a partial sub-parse failure', () => {
  // SAD PATH TEST (Bug Reproduction)
  // Arrange
  const parser = b.object({
    items: b.greedyRange(FailableItem),
    trailer: b.uint16(), // A field to parse *after* the range
  });

  const binaryData = new Uint8Array([
    // Item 1 (Valid)
    0x00, 0x01, 0xaa, 0xbb,
    // Trailer data that should be parsed correctly
    0xee, 0xff,
    // Garbage data that will cause the *next* FailableItem parse to fail
    // It will read 0x1122 as `data`, then fail the `Const` check.
    0x11, 0x22, 0xcc, 0xdd,
  ]);

  // Act
  const result = parser.parse(binaryData);

  // Assert
  // 1. It should have found only the one valid item.
  expect(result.items).toHaveLength(1);
  expect(result.items[0].data).toBe(1);

  // 2. This is the crucial check. If the offset was rolled back correctly
  //    after the failed attempt, the trailer should be parsed from the
  //    correct position (byte 4) and have the value 0xEEFF.
  //    If the bug existed, the offset would be left at byte 8, and the
  //    trailer would be parsed incorrectly as 0xCCDD.
  expect(result.trailer).toBe(0xeeff); // 61183 in decimal
});
