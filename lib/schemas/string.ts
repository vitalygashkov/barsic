import { checkBounds } from '../context';
import { LengthFunc, Schema, createSchema } from '../schema';
import { fromBuffer, fromText } from '../utils';
import { base64 } from './base64';
import { hex } from './hex';

export const string = (length?: number | LengthFunc) => {
  const schema = createSchema<string>('String', {
    _parse: (ctx) => {
      let len = typeof length === 'function' ? length(ctx.context) : length;
      if (typeof len !== 'number' || isNaN(len)) {
        len = ctx.dataView.buffer.byteLength;
      }
      ctx.enter(`String(len=${len})`);
      if (len < 0) len = 0;
      checkBounds(ctx, len);
      const value = new Uint8Array(ctx.dataView.buffer, ctx.dataView.byteOffset + ctx.offset, len);
      const parsed = fromBuffer(value).toText();
      ctx.offset += len;
      ctx.leave('String', parsed);
      return parsed;
    },
    _build: (v, ctx) => {
      let len = typeof length === 'function' ? length(ctx.context) : length;
      ctx.enter(`String(len=${len})`, v);
      if (len === undefined) {
        len = v.length;
      } else if (v.length !== len) {
        throw new Error(`String length mismatch: expected ${len}, got ${v.length}`);
      }
      ctx.buffers.push(fromText(v).toBuffer());
      ctx.leave(`String(len=${len})`, v.length);
    },
  });

  const extensions = {
    base64: (valueLength?: number | LengthFunc) => {
      return base64(valueLength ?? length);
    },
    hex: (valueLength?: number | LengthFunc) => {
      return hex(valueLength ?? length);
    },
  };

  return {
    ...schema,
    ...extensions,
  } as Schema<string> & typeof extensions;
};
