import { checkBounds } from '../context';
import { LengthFunc, createSchema } from '../schema';
import { fromBuffer, fromText, fromBase64, fromHex } from '../utils';

export const string = (length?: number | LengthFunc) => {
  const schema = createSchema('String', {
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

  return schema;
};

export const base64 = (length?: number | LengthFunc) => {
  return createSchema('Base64', {
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

export const hex = (length?: number | LengthFunc) => {
  return createSchema('Hex', {
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
