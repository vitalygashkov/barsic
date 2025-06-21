import { ContextData } from '../context';
import { createSchema, Schema } from '../schema';

export type DiscriminatedUnionFunc = (context: ContextData) => any;
export type DiscriminatedUnionKey = string | DiscriminatedUnionFunc;

export const discriminatedUnion = <T, K extends Schema<any>>(
  discriminator: DiscriminatedUnionKey,
  options: { [key: string]: K },
  defaultCase?: Schema<any>
) => {
  return createSchema('DiscriminatedUnion', {
    _parse: (ctx) => {
      const key = typeof discriminator === 'function' ? discriminator(ctx.context) : ctx.context[discriminator];
      ctx.enter(`DiscriminatedUnion(key=${key})`);
      const subSchema = options[key] || defaultCase;
      if (!subSchema) throw new Error(`DiscriminatedUnion case not found for key: ${key}`);
      const result: T = subSchema._parse(ctx);
      ctx.leave(`DiscriminatedUnion(key=${key})`, result);
      return result;
    },
    _build: (value, ctx) => {
      const tempContext = { ...ctx.context, ...value };
      const key = typeof discriminator === 'function' ? discriminator(tempContext) : ctx.context[discriminator];
      ctx.enter(`DiscriminatedUnion(key=${key})`);
      const subSchema = options[key] || defaultCase;
      if (!subSchema) throw new Error(`DiscriminatedUnion case not found for key: ${key}`);

      const buildContext = Object.create(ctx.context);
      Object.assign(buildContext, value);
      ctx.stack.push(buildContext);
      subSchema._build(value, ctx);
      ctx.stack.pop();
      ctx.leave(`DiscriminatedUnion(key=${key})`);
    },
  }) as K;
};
