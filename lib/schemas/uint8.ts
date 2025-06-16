import { checkBounds } from '../context';
import { createSchema } from '../schema';

export const uint8 = () => {
  return createSchema<number>('Uint8', {
    _parse: (ctx) => {
      ctx.enter('Uint8');
      checkBounds(ctx, 1);
      const v = ctx.dataView.getUint8(ctx.offset);
      ctx.offset += 1;
      ctx.leave('Uint8', v);
      return v;
    },
    _build: (v, ctx) => {
      ctx.enter('Uint8', v);
      const buffer = new ArrayBuffer(1);
      const view = new DataView(buffer);
      view.setUint8(0, v);
      ctx.buffers.push(new Uint8Array(buffer));
      ctx.leave('Uint8', 1);
    },
  });
};
