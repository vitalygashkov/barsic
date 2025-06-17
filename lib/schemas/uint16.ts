import { checkBounds } from '../context';
import { createSchema, Schema } from '../schema';

export const uint16 = (littleEndian: boolean = false) => {
  const schema = createSchema<number>('Uint16', {
    _parse: (ctx) => {
      ctx.enter('Uint16');
      checkBounds(ctx, 2);
      const v = ctx.dataView.getUint16(ctx.offset, littleEndian);
      ctx.offset += 2;
      ctx.leave('Uint16', v);
      return v;
    },
    _build: (v, ctx) => {
      ctx.enter('Uint16', v);
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setUint16(0, v, littleEndian);
      ctx.buffers.push(new Uint8Array(buffer));
      ctx.leave('Uint16', 2);
    },
  });

  const extensions = {
    endian: (value: 'le' | 'be') => {
      littleEndian = value === 'le';
      return schema;
    },
  };

  return {
    ...schema,
    ...extensions,
  } as Schema<number> & typeof extensions;
};
