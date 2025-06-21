import { checkBounds } from '../context';
import { LengthFunc, createSchema } from '../schema';

export const bytes = (length: number | LengthFunc) =>
  createSchema('Bytes', {
    _parse: (ctx) => {
      let len = typeof length === 'function' ? length(ctx.context) : length;
      if (typeof len !== 'number' || isNaN(len)) {
        throw new Error(`Invalid length for Bytes: ${len}, context: ${JSON.stringify(ctx.context)}`);
      }
      ctx.enter(`Bytes(len=${len})`);
      if (len < 0) len = 0;
      checkBounds(ctx, len);
      const value = new Uint8Array(ctx.dataView.buffer, ctx.dataView.byteOffset + ctx.offset, len);
      ctx.offset += len;
      ctx.leave('Bytes', value);
      return value;
    },
    _build: (v, ctx) => {
      const len = typeof length === 'function' ? length(ctx.context) : length;
      ctx.enter(`Bytes(len=${len})`, v);
      if (v.length !== len) {
        throw new Error(`Bytes length mismatch: expected ${len}, got ${v.length}`);
      }
      ctx.buffers.push(v);
      ctx.leave(`Bytes(len=${len})`, v.length);
    },
  });
