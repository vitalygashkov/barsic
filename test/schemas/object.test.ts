import { expect, test } from 'vitest';
import { b } from '../../lib';

test('Object should build and parse symmetrically', () => {
  // Arrange
  const parser = b.object({
    magic: b.uint16(),
    value: b.uint32(),
  });
  const obj = { magic: 0xcafe, value: 42 };
  const expectedBytes = new Uint8Array([0xca, 0xfe, 0x00, 0x00, 0x00, 0x2a]);

  // Act: Build
  const built = parser.build(obj);

  // Assert: Build
  expect(built).toEqual(expectedBytes);

  // Act & Assert: Parse (Symmetry)
  const parsed = parser.parse(built);
  expect(parsed).toEqual(obj);
});

test('Object handles nested structures', () => {
  const person = b.object({
    id: b.uint32(),
    name: b.bytes(5),
    age: b.uint16(),
  });

  const data = new Uint8Array([
    0x00,
    0x01,
    0x02,
    0x03, // id: 0x010203
    0x4a,
    0x6f,
    0x68,
    0x6e,
    0x00, // name: "John\x00"
    0x00,
    0x21, // age: 33
  ]);

  const obj = {
    id: 0x010203,
    name: new Uint8Array([0x4a, 0x6f, 0x68, 0x6e, 0x00]),
    age: 33,
  };

  expect(person.parse(data)).toEqual(obj);
  expect(person.build(obj)).toEqual(data);
});

test('Context propagation in nested objects', () => {
  const parser = b.object({
    header: b.object({
      type: b.uint16(),
      length: b.uint16(),
    }),
    data: b.discriminatedUnion(
      (ctx) => ctx.header.type, // Access type through header
      {
        1: b.object({
          value: b.uint32(),
          extra: b.bytes((ctx) => ctx.header.length - 4), // Access length through header
        }),
        2: b.object({
          count: b.uint16(),
          items: b.array(b.uint16(), (ctx) => ctx.count),
        }),
      }
    ),
  });

  // Type 1
  const type1Data = new Uint8Array([
    0x00,
    0x01, // type = 1
    0x00,
    0x08, // length = 8
    0x12,
    0x34,
    0x56,
    0x78, // value
    0xaa,
    0xbb,
    0xcc,
    0xdd, // extra (4 bytes)
  ]);

  expect(parser.parse(type1Data)).toEqual({
    header: { type: 1, length: 8 },
    data: {
      value: 0x12345678,
      extra: new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]),
    },
  });

  // Type 2
  const type2Data = new Uint8Array([
    0x00,
    0x02, // type = 2
    0x00,
    0x06, // length = 6
    0x00,
    0x02, // count = 2
    0x00,
    0x0a, // item1 = 10
    0x00,
    0x14, // item2 = 20
  ]);

  expect(parser.parse(type2Data)).toEqual({
    header: { type: 2, length: 6 },
    data: {
      count: 2,
      items: [10, 20],
    },
  });
});
