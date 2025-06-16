import { checkBounds } from '../context';
import { createSchema } from '../schema';

export const uint32 = (littleEndian: boolean = false) => {
  return createSchema<number>('Int32ub', {
    _parse: (ctx) => {
      ctx.enter('Int32ub');
      checkBounds(ctx, 4);
      const v = ctx.dataView.getUint32(ctx.offset, littleEndian);
      ctx.offset += 4;
      ctx.leave('Int32ub', v);
      return v;
    },
    _build: (v, ctx) => {
      ctx.enter('Int32ub', v);
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint32(0, v, littleEndian);
      ctx.buffers.push(new Uint8Array(buffer));
      ctx.leave('Int32ub', 4);
    },
  });
};
