import { checkBounds } from '../context';
import { LengthFunc, createSchema } from '../schema';
import { fromBuffer, fromBase64 } from '../utils';

export const base64 = (length?: number | LengthFunc) => {
  return createSchema<string>('Base64', {
    _parse: (ctx) => {
      let len = typeof length === 'function' ? length(ctx.context) : length;
      if (typeof len !== 'number' || isNaN(len)) {
        len = ctx.dataView.buffer.byteLength;
      }
      ctx.enter(`Base64(len=${len})`);
      if (len < 0) len = 0;
      checkBounds(ctx, len);
      const value = new Uint8Array(ctx.dataView.buffer, ctx.dataView.byteOffset + ctx.offset, len);
      const parsed = fromBuffer(value).toBase64();
      ctx.offset += len;
      ctx.leave('Base64', parsed);
      return parsed;
    },
    _build: (v, ctx) => {
      let len = typeof length === 'function' ? length(ctx.context) : length;
      ctx.enter(`Base64(len=${len})`, v);
      if (len === undefined) {
        len = v.length;
      } else if (v.length !== len) {
        throw new Error(`Base64 length mismatch: expected ${len}, got ${v.length}`);
      }
      ctx.buffers.push(fromBase64(v).toBuffer());
      ctx.leave(`Base64(len=${len})`, v.length);
    },
  });
};
