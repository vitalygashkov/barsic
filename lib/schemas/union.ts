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
      const parsedKey = typeof key === 'function' ? key(ctx.context) : ctx.context[key];
      ctx.enter(`DiscriminatedUnion(key=${parsedKey})`);
      const subSchema = options[parsedKey] || defaultCase;
      if (!subSchema) throw new Error(`DiscriminatedUnion case not found for key: ${parsedKey}`);
      const result: T = subSchema._parse(ctx);
      ctx.leave(`DiscriminatedUnion(key=${parsedKey})`, result);
      return result;
    },
    _build: (value, ctx) => {
      const tempContext = { ...ctx.context, ...value };
      const parsedKey = typeof key === 'function' ? key(tempContext) : ctx.context[key];
      ctx.enter(`DiscriminatedUnion(key=${parsedKey})`);
      const subSchema = options[parsedKey] || defaultCase;
      if (!subSchema) throw new Error(`DiscriminatedUnion case not found for key: ${parsedKey}`);

      const buildContext = Object.create(ctx.context);
      Object.assign(buildContext, value);
      ctx.stack.push(buildContext);
      subSchema._build(value, ctx);
      ctx.stack.pop();
      ctx.leave(`DiscriminatedUnion(key=${parsedKey})`);
    },
  }) as K;
};
