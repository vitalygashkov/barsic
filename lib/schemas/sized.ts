import { BuildingContext, checkBounds } from '../context';
import { Schema, createSchema } from '../schema';
import { concatUint8Arrays } from '../utils';

/**
 * Enforces that a sub-construct consumes a specific number of bytes,
 * consuming any leftover bytes as padding. The total size is determined
 * by a function that inspects the parsed data itself.
 */
export const sized = <T>(subcon: Schema<T>, lengthFunc: (item: T) => number) => {
  if (!subcon || typeof subcon._parse !== 'function' || typeof subcon._build !== 'function') {
    throw new Error(
      'Sized: Invalid sub-construct provided. The first argument must be a valid construct object (e.g., Struct, Bytes).'
    );
  }
  if (typeof lengthFunc !== 'function') {
    throw new Error(
      'Sized: Invalid length function provided. The second argument must be a function that returns a number.'
    );
  }
  return createSchema<T>(`Sized<${(subcon as any)._name}>`, {
    _parse: (ctx) => {
      const startOffset = ctx.offset;
      ctx.enter(`Sized<${(subcon as any)._name}>`);
      const item = subcon._parse(ctx);
      const expectedTotalSize = lengthFunc(item);

      if (typeof expectedTotalSize !== 'number' || isNaN(expectedTotalSize)) {
        throw new Error(`Sized: Invalid length returned by function: ${expectedTotalSize}`);
      }
      const consumedSize = ctx.offset - startOffset;
      if (expectedTotalSize < consumedSize) {
        throw new Error(
          `Sized: Sub-parser consumed ${consumedSize} bytes, which is more than the expected total size of ${expectedTotalSize}.`
        );
      }
      const paddingSize = expectedTotalSize - consumedSize;
      if (paddingSize > 0) {
        ctx.log(`Consuming ${paddingSize} bytes of padding.`);
        checkBounds(ctx, paddingSize);
        ctx.offset += paddingSize;
      }
      ctx.leave(`Sized<${(subcon as any)._name}>`, item);
      return item;
    },
    _build: (v, ctx) => {
      ctx.enter(`Sized<${(subcon as any)._name}>`, v);
      const subBuildingContext = new BuildingContext(undefined, ctx.debug);
      subBuildingContext.stack = [...ctx.stack];
      subcon._build(v, subBuildingContext);
      const subBuffer = concatUint8Arrays(subBuildingContext.buffers);

      const expectedTotalSize = lengthFunc(v);
      const paddingSize = expectedTotalSize - subBuffer.length;

      if (paddingSize < 0) {
        throw new Error(
          `Sized build: Built data (${subBuffer.length} bytes) is larger than expected total size (${expectedTotalSize} bytes).`
        );
      }
      ctx.buffers.push(subBuffer);
      if (paddingSize > 0) {
        ctx.buffers.push(new Uint8Array(paddingSize));
      }
      ctx.leave(`Sized<${(subcon as any)._name}>`, subBuffer.length + paddingSize);
    },
  });
};
