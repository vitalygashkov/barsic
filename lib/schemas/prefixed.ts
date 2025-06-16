import { BuildingContext, checkBounds, ParsingContext } from '../context';
import { Schema, LengthFunc, createSchema } from '../schema';
import { concatUint8Arrays } from '../utils';

export const prefixed = <T extends Schema<any>>(length: LengthFunc, subSchema: T) =>
  createSchema(`Prefixed<${(subSchema as any)._name}>`, {
    _parse: (ctx) => {
      const len = length(ctx.context);
      ctx.enter(`Prefixed(len=${len})`);
      checkBounds(ctx, len);

      // Create a new DataView and ParsingContext for the sub-parser,
      // scoped to the specified length.
      const subDataView = new DataView(ctx.dataView.buffer, ctx.dataView.byteOffset + ctx.offset, len);
      const subContext = new ParsingContext(subDataView, 0, ctx.debug);
      subContext.stack = [...ctx.stack];

      const result = subSchema._parse(subContext);

      // Advance the offset of the *main* context by the full length
      // of the prefixed section.
      ctx.offset += len;

      ctx.leave(`Prefixed(len=${len})`, result);
      return result;
    },
    _build: (v, ctx) => {
      // Build the sub-construct in a temporary context to get its buffer.
      const subBuildingContext = new BuildingContext();
      subBuildingContext.stack = [...ctx.stack];
      subSchema._build(v, subBuildingContext);
      const subBuffer = concatUint8Arrays(subBuildingContext.buffers);

      // In this version of Prefixed, the length is determined by the context
      // during parsing, so we don't build a length field here. We just
      // ensure the built data is what we expect.
      ctx.buffers.push(subBuffer);
    },
  }) as T;
