import { checkBounds, ParsingContext } from '../context';
import { createSchema } from '../schema';

const number = <T, E>({
  name,
  byteLength,
  getValue,
  setValue,
  extensions,
}: {
  name: string;
  byteLength: number;
  getValue: (ctx: ParsingContext) => T;
  setValue: (view: DataView, value: T) => void;
  extensions?: E;
}) => {
  return createSchema(
    name,
    {
      _parse: (ctx) => {
        ctx.enter(name);
        checkBounds(ctx, byteLength);
        const value = getValue(ctx);
        ctx.offset += byteLength;
        ctx.leave(name, value);
        return value;
      },
      _build: (value, ctx) => {
        ctx.enter(name, value);
        const buffer = new ArrayBuffer(byteLength);
        const view = new DataView(buffer);
        setValue(view, value);
        ctx.buffers.push(new Uint8Array(buffer));
        ctx.leave(name, byteLength);
      },
    },
    extensions
  );
};

export const int8 = () => {
  return number({
    name: 'int8',
    byteLength: 1,
    getValue: (ctx) => ctx.dataView.getInt8(ctx.offset),
    setValue: (view, value) => view.setInt8(0, value),
  });
};

export const uint8 = () => {
  return number({
    name: 'uint8',
    byteLength: 1,
    getValue: (ctx) => ctx.dataView.getUint8(ctx.offset),
    setValue: (view, value) => view.setUint8(0, value),
  });
};

export const int16 = (littleEndian: boolean = false) => {
  const schema = number({
    name: 'int16',
    byteLength: 2,
    getValue: (ctx) => ctx.dataView.getInt16(ctx.offset, littleEndian),
    setValue: (view, value) => view.setInt16(0, value, littleEndian),
    extensions: {
      endian: (value: 'le' | 'be') => {
        littleEndian = value === 'le';
        return schema;
      },
    },
  });
  return schema;
};

export const uint16 = (littleEndian: boolean = false) => {
  const schema = number({
    name: 'uint16',
    byteLength: 2,
    getValue: (ctx) => ctx.dataView.getUint16(ctx.offset, littleEndian),
    setValue: (view, value) => view.setUint16(0, value, littleEndian),
    extensions: {
      endian: (value: 'le' | 'be') => {
        littleEndian = value === 'le';
        return schema;
      },
    },
  });
  return schema;
};

export const int32 = (littleEndian: boolean = false) => {
  const schema = number({
    name: 'int32',
    byteLength: 4,
    getValue: (ctx) => ctx.dataView.getInt32(ctx.offset, littleEndian),
    setValue: (view, value) => view.setInt32(0, value, littleEndian),
    extensions: {
      endian: (value: 'le' | 'be') => {
        littleEndian = value === 'le';
        return schema;
      },
    },
  });
  return schema;
};

export const uint32 = (littleEndian: boolean = false) => {
  const schema = number({
    name: 'uint32',
    byteLength: 4,
    getValue: (ctx) => ctx.dataView.getUint32(ctx.offset, littleEndian),
    setValue: (view, value) => view.setUint32(0, value, littleEndian),
    extensions: {
      endian: (value: 'le' | 'be') => {
        littleEndian = value === 'le';
        return schema;
      },
    },
  });
  return schema;
};

export const int64 = (littleEndian: boolean = false) => {
  const schema = number({
    name: 'int64',
    byteLength: 8,
    getValue: (ctx) => ctx.dataView.getBigInt64(ctx.offset, littleEndian),
    setValue: (view, value) => view.setBigInt64(0, value, littleEndian),
    extensions: {
      endian: (value: 'le' | 'be') => {
        littleEndian = value === 'le';
        return schema;
      },
    },
  });
  return schema;
};

export const uint64 = (littleEndian: boolean = false) => {
  const schema = number({
    name: 'uint64',
    byteLength: 8,
    getValue: (ctx) => ctx.dataView.getBigUint64(ctx.offset, littleEndian),
    setValue: (view, value) => view.setBigUint64(0, value, littleEndian),
    extensions: {
      endian: (value: 'le' | 'be') => {
        littleEndian = value === 'le';
        return schema;
      },
    },
  });
  return schema;
};

export const float16 = (littleEndian: boolean = false) => {
  const schema = number({
    name: 'float16',
    byteLength: 2,
    getValue: (ctx) => ctx.dataView.getFloat16(ctx.offset, littleEndian),
    setValue: (view, value) => view.setFloat16(0, value, littleEndian),
    extensions: {
      endian: (value: 'le' | 'be') => {
        littleEndian = value === 'le';
        return schema;
      },
    },
  });
  return schema;
};

export const float32 = (littleEndian: boolean = false) => {
  const schema = number({
    name: 'float32',
    byteLength: 4,
    getValue: (ctx) => ctx.dataView.getFloat32(ctx.offset, littleEndian),
    setValue: (view, value) => view.setFloat32(0, value, littleEndian),
    extensions: {
      endian: (value: 'le' | 'be') => {
        littleEndian = value === 'le';
        return schema;
      },
    },
  });
  return schema;
};

export const float64 = (littleEndian: boolean = false) => {
  const schema = number({
    name: 'float64',
    byteLength: 8,
    getValue: (ctx) => ctx.dataView.getFloat64(ctx.offset, littleEndian),
    setValue: (view, value) => view.setFloat64(0, value, littleEndian),
    extensions: {
      endian: (value: 'le' | 'be') => {
        littleEndian = value === 'le';
        return schema;
      },
    },
  });
  return schema;
};
