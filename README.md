# barsic

Barsic allows you to declaratively encode and decode binary data. It supports a wide variety of types to enable you to express a multitude of binary formats without writing any parsing code.

## Features

- 🚀 **Simple & Declarative API** - Define binary formats using a straightforward object syntax
- 🔄 **Two-way Conversion** - Both encode (build) and decode (parse) operations
- 📦 **Rich Type System** - Supports integers, strings, arrays, nested objects, variants, and more
- 🎯 **Type-safe** - Full TypeScript support with proper type inference
- 🔬 **Zero Dependencies** - Lightweight and self-contained
- ⚡️ **High Performance** - Optimized for both speed and memory usage

## Install

```bash
npm i barsic
```

## Usage

```typescript
import { b } from 'barsic';

// Define a simple user profile format
const UserProfile = b.object({
  version: b.uint8(), // Format version
  nameLength: b.uint8(), // Length of the name string
  name: b.string(), // User's name
  age: b.uint8(), // User's age
  scores: b.array(b.uint16(), 3), // Array of 3 game scores
});

// Create binary data
const profileData = UserProfile.build({
  version: 1,
  nameLength: 4,
  name: 'John',
  age: 25,
  scores: [100, 250, 175],
});

console.log(profileData);
// Output: Uint8Array([
//   0x01,             // version = 1
//   0x04,             // nameLength = 4
//   0x4A, 0x6F, 0x68, // "John"
//   0x6E,
//   0x19,             // age = 25
//   0x00, 0x64,       // scores[0] = 100
//   0x00, 0xFA,       // scores[1] = 250
//   0x00, 0xAF        // scores[2] = 175
// ])

// Parse binary data back into an object
const parsed = UserProfile.parse(profileData);
console.log(parsed);
// Output:
// {
//   version: 1,
//   nameLength: 4,
//   name: "John",
//   age: 25,
//   scores: [100, 250, 175]
// }
```

```typescript
import { b } from 'barsic';

// Define a scheme for a simple packet format
const Packet = b.object({
  header: b.object({
    magic: b.literal(new Uint8Array([0xca, 0xfe])), // Magic bytes
    type: b.uint16(),
    length: b.uint32(),
  }),
  payload: b.variant(
    (ctx) => ctx.header.type, // Select variant based on type field
    {
      1: b.object({
        // Type 1: Text message
        message: b.string(),
      }),
      2: b.object({
        // Type 2: Array of numbers
        count: b.uint16(),
        values: b.array(b.uint32(), (ctx) => ctx.count),
      }),
    }
  ),
});

// Example 1: Parse text message packet
const textPacket = new Uint8Array([
  0xca,
  0xfe, // Magic bytes
  0x00,
  0x01, // Type = 1 (text)
  0x00,
  0x00,
  0x00,
  0x0b, // Length = 11
  0x48,
  0x65,
  0x6c,
  0x6c, // "Hello World"
  0x6f,
  0x20,
  0x57,
  0x6f,
  0x72,
  0x6c,
  0x64,
]);

const parsed1 = Packet.parse(textPacket);
console.log(parsed1);
// Output:
// {
//   header: {
//     magic: Uint8Array([0xCA, 0xFE]),
//     type: 1,
//     length: 11
//   },
//   payload: {
//     message: "Hello World"
//   }
// }

// Example 2: Build array packet
const arrayPacket = Packet.build({
  header: {
    magic: new Uint8Array([0xca, 0xfe]),
    type: 2,
    length: 14,
  },
  payload: {
    count: 3,
    values: [1, 2, 3],
  },
});

console.log(arrayPacket);
// Output: Uint8Array([
//   0xCA, 0xFE,           // Magic
//   0x00, 0x02,           // Type = 2 (array)
//   0x00, 0x00, 0x00, 0x0E, // Length = 14
//   0x00, 0x03,           // Count = 3
//   0x00, 0x00, 0x00, 0x01, // value[0] = 1
//   0x00, 0x00, 0x00, 0x02, // value[1] = 2
//   0x00, 0x00, 0x00, 0x03  // value[2] = 3
// ])
```

## Available Types

Barsic provides the following built-in types:

- **Integers**

  - `uint8()` - 8-bit unsigned integer
  - `uint16()` - 16-bit unsigned integer
  - `uint32()` - 32-bit unsigned integer

- **Strings**

  - `string()` - UTF-8 encoded string

- **Compound Types**
  - `array(type, length)` - Fixed or variable length array
  - `object({...})` - Object with named fields
  - `variant(discriminator, cases)` - Tagged union type
  - `literal(value)` - Exact value matcher

## License

MIT
