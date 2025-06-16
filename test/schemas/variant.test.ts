import { expect, test } from 'vitest';
import { b } from '../../lib';

test('Variant should build and parse symmetrically', () => {
  // Arrange
  const parser = b.object({
    type: b.uint16(),
    data: b.variant((ctx) => ctx.type, {
      1: b.uint32(),
      2: b.bytes(4),
    }),
  });

  // Case 1
  const obj1 = { type: 1, data: 9999 };
  const expectedBytes1 = new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x27, 0x0f]);

  // Case 2
  const obj2 = { type: 2, data: new Uint8Array([1, 2, 3, 4]) };
  const expectedBytes2 = new Uint8Array([0x00, 0x02, 1, 2, 3, 4]);

  // Act & Assert: Case 1
  const built1 = parser.build(obj1);
  expect(built1).toEqual(expectedBytes1);
  const parsed1 = parser.parse(built1);
  expect(parsed1).toEqual(obj1);

  // Act & Assert: Case 2
  const built2 = parser.build(obj2);
  expect(built2).toEqual(expectedBytes2);
  const parsed2 = parser.parse(built2);
  expect(parsed2).toEqual(obj2);
});

test('Variant handles different cases', () => {
  // Define the parser with proper context handling
  const parser = b.object({
    type: b.uint16(),
    data: b.variant(
      (ctx) => ctx.type,
      {
        1: b.object({
          value: b.uint16(),
        }),
        2: b.object({
          value: b.uint32(),
        }),
      },
      b.object({}) // Empty struct for default case
    ),
  });

  const type1 = new Uint8Array([0x00, 0x01, 0xca, 0xfe]);
  const type2 = new Uint8Array([0x00, 0x02, 0xca, 0xfe, 0xba, 0xbe]);
  const unknown = new Uint8Array([0x00, 0x03]);

  // Parsing tests
  expect(parser.parse(type1)).toEqual({
    type: 1,
    data: { value: 0xcafe },
  });

  expect(parser.parse(type2)).toEqual({
    type: 2,
    data: { value: 0xcafebabe },
  });

  expect(parser.parse(unknown)).toEqual({
    type: 3,
    data: {},
  });

  // Building tests
  expect(
    parser.build({
      type: 1,
      data: { value: 0xcafe },
    })
  ).toEqual(type1);

  expect(
    parser.build({
      type: 2,
      data: { value: 0xcafebabe },
    })
  ).toEqual(type2);

  expect(
    parser.build({
      type: 3,
      data: {},
    })
  ).toEqual(unknown);
});
