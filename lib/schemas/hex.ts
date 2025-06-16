import { checkBounds } from '../context';
import { createSchema, LengthFunc } from '../schema';
import { fromBuffer, fromHex } from '../utils';

export const hex = (length?: number | LengthFunc) => {
  return createSchema<string>('Hex', {
    _parse: (ctx) => {
      let len = typeof length === 'function' ? length(ctx.context) : length;
      if (typeof len !== 'number' || isNaN(len)) {
        len = ctx.dataView.buffer.byteLength;
      }
      ctx.enter(`Hex(len=${len})`);
      if (len < 0) len = 0;
      checkBounds(ctx, len);
      const value = new Uint8Array(ctx.dataView.buffer, ctx.dataView.byteOffset + ctx.offset, len);
      const parsed = fromBuffer(value).toHex();
      ctx.offset += len;
      ctx.leave('Hex', parsed);
      return parsed;
    },
    _build: (v, ctx) => {
      let len = typeof length === 'function' ? length(ctx.context) : length;
      ctx.enter(`Hex(len=${len})`, v);
      if (len === undefined) {
        len = v.length;
      } else if (v.length !== len) {
        throw new Error(`Hex length mismatch: expected ${len}, got ${v.length}`);
      }
      ctx.buffers.push(fromHex(v).toBuffer());
      ctx.leave(`Hex(len=${len})`, v.length);
    },
  });
};
