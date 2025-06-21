import { checkBounds, ParsingContext } from '../context';
import { createSchema } from '../schema';

const number = <E>({
  name,
  byteLength,
  getValue,
  setValue,
  extensions,
}: {
  name: string;
  byteLength: number;
  getValue: (ctx: ParsingContext) => number;
  setValue: (view: DataView, value: number) => void;
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

export const uint8 = () => {
  return number({
    name: 'uint8',
    byteLength: 1,
    getValue: (ctx) => ctx.dataView.getUint8(ctx.offset),
    setValue: (view, value) => view.setUint8(0, value),
  });
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
