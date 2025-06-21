import { checkBounds } from '../context';
import { createSchema } from '../schema';
import { arraysEqual } from '../utils';

export const literal = (expected: Uint8Array | string) => {
  const data = typeof expected === 'string' ? new TextEncoder().encode(expected) : expected;
  return createSchema('Const', {
    _parse: (ctx) => {
      ctx.enter('Const');
      checkBounds(ctx, data.length);
      const actual = new Uint8Array(ctx.dataView.buffer, ctx.dataView.byteOffset + ctx.offset, data.length);
      ctx.offset += data.length;

      if (!arraysEqual(actual, data)) {
        throw new Error(`Literal mismatch: expected [${expected}] but got [${actual}]`);
      }
      ctx.leave('Const', data);
      return data;
    },
    _build: (value, ctx) => {
      ctx.enter('Const', value);
      if (value && !arraysEqual(value, data)) {
        throw new Error(`Const build mismatch: expected [${expected}] but got [${value}]`);
      }
      ctx.buffers.push(data);
      ctx.leave('Const', data.length);
    },
  });
};
