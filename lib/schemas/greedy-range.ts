import { Schema, createSchema } from '../schema';

export const greedyRange = <T>(subSchema: Schema<T>) =>
  createSchema<T[]>(`GreedyRange<${(subSchema as any)._name}>`, {
    _parse: (ctx) => {
      ctx.enter(`GreedyRange<${(subSchema as any)._name}>`);
      const items: T[] = [];
      while (ctx.bytesRemaining > 0) {
        // This is the offset before we ATTEMPT to parse the next item.
        const startOffset = ctx.offset;
        try {
          const item = subSchema._parse(ctx);
          items.push(item);
          if (ctx.offset === startOffset) {
            ctx.log('Sub-parser consumed 0 bytes, breaking GreedyRange.');
            break;
          }
        } catch (e) {
          ctx.log(`GreedyRange terminated due to sub-parser error: ${e instanceof Error ? e.message : e}`);
          ctx.offset = startOffset;
          break;
        }
      }
      ctx.leave(`GreedyRange<${(subSchema as any)._name}>`, items);
      return items;
    },
    _build: (v, ctx) => {
      ctx.enter(`GreedyRange<${(subSchema as any)._name}>`);
      for (const item of v) {
        subSchema._build(item, ctx);
      }
      ctx.leave(`GreedyRange<${(subSchema as any)._name}>`);
    },
  });
