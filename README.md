# barsic

A parser and builder for binary data.

## Installation

```bash
npm install barsic
```

## Usage

```typescript
import { Int16ub, Struct, GreedyRange } from 'barsic';

const parser = Struct({
  magic: Int16ub,
  items: GreedyRange(Int16ub),
});

const binaryData = new Uint8Array([0x00, 0x01, 0x00, 0x02, 0x00, 0x03]);

const result = parser.parse(binaryData);

console.log(result); // { magic: 1, items: [2, 3] }
```

## API

### `Int8ub`

Parses and builds an 8-bit unsigned integer.

### `Int16ub`

Parses and builds a 16-bit unsigned integer.

### `Int32ub`

Parses and builds a 32-bit unsigned integer.

### `Bytes`

Parses and builds a fixed-length byte array.

### `Const`

Parses and builds a constant byte array.

### `Struct`

Parses and builds a structure of fields.

### `List`

Parses and builds a list of items.

### `GreedyRange`

Parses and builds a list of items, stopping when the end of the data is reached.

### `Switch`

Parses and builds a value based on a switch case.

### `Prefixed`

Parses and builds a value with a fixed length prefix.

### `Sized`

Parses and builds a value with a dynamic length prefix.

## License

MIT
