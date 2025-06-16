import { ContextData } from '../context';
import { createSchema, Schema } from '../schema';

export type VariantFunc = (context: ContextData) => any;
export type VariantKey = string | VariantFunc;

export const variant = <T, K extends Schema<any>>(
  key: VariantKey,
  options: { [key: string]: K },
  defaultCase?: Schema<any>
) => {
  return createSchema<T>('Variant', {
    _parse: (ctx) => {
      const keyString = typeof key === 'function' ? key(ctx.context) : key;
      ctx.enter(`Variant(key=${keyString})`);
      const subcon = options[keyString] || defaultCase;
      if (!subcon) throw new Error(`Variant case not found for key: ${keyString}`);
      const result = subcon._parse(ctx);
      ctx.leave(`Variant(key=${keyString})`, result);
      return result;
    },
    _build: (value, ctx) => {
      const tempContext = { ...ctx.context, ...value };
      const keyString = typeof key === 'function' ? key(tempContext) : key;
      ctx.enter(`Variant(key=${keyString})`);
      const subcon = options[keyString] || defaultCase;
      if (!subcon) throw new Error(`Variant case not found for key: ${keyString}`);

      const buildContext = Object.create(ctx.context);
      Object.assign(buildContext, value);
      ctx.stack.push(buildContext);
      subcon._build(value, ctx);
      ctx.stack.pop();
      ctx.leave(`Variant(key=${keyString})`);
    },
  }) as K;
};
