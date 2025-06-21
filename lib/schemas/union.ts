import { ContextData } from '../context';
import { createSchema, Schema } from '../schema';

export type DiscriminatedUnionFunc = (context: ContextData) => any;
export type DiscriminatedUnionKey = string | DiscriminatedUnionFunc;

export const discriminatedUnion = <T, K extends Schema<any>>(
  key: DiscriminatedUnionKey,
  options: { [key: string]: K },
  defaultCase?: Schema<any>
) => {
  return createSchema('DiscriminatedUnion', {
    _parse: (ctx) => {
      const keyString = typeof key === 'function' ? key(ctx.context) : key;
      ctx.enter(`DiscriminatedUnion(key=${keyString})`);
      const subSchema = options[keyString] || defaultCase;
      if (!subSchema) throw new Error(`Variant case not found for key: ${keyString}`);
      const result: T = subSchema._parse(ctx);
      ctx.leave(`DiscriminatedUnion(key=${keyString})`, result);
      return result;
    },
    _build: (value, ctx) => {
      const tempContext = { ...ctx.context, ...value };
      const keyString = typeof key === 'function' ? key(tempContext) : key;
      ctx.enter(`DiscriminatedUnion(key=${keyString})`);
      const subSchema = options[keyString] || defaultCase;
      if (!subSchema) throw new Error(`DiscriminatedUnion case not found for key: ${keyString}`);

      const buildContext = Object.create(ctx.context);
      Object.assign(buildContext, value);
      ctx.stack.push(buildContext);
      subSchema._build(value, ctx);
      ctx.stack.pop();
      ctx.leave(`DiscriminatedUnion(key=${keyString})`);
    },
  }) as K;
};
