import { ContextData, Schema, createSchema } from '../schema';

export const object = <T extends ContextData>(fields: {
  [key in keyof T]: Schema<T[key]>;
}) =>
  createSchema<T>('Struct', {
    _parse: (ctx) => {
      ctx.enter('Struct');
      const newContext = Object.create(ctx.context);
      ctx.stack.push(newContext);
      for (const key in fields) {
        const result = fields[key]._parse(ctx);
        newContext[key] = result;
      }
      ctx.stack.pop();
      const finalResult = Object.assign({}, newContext);
      ctx.leave('Struct', finalResult);
      return finalResult;
    },
    _build: (value, ctx) => {
      ctx.enter('Struct', value);
      const mergedContext = Object.create(ctx.context);
      Object.assign(mergedContext, value);
      ctx.stack.push(mergedContext);
      for (const key in fields) {
        fields[key]._build(value[key], ctx);
      }
      ctx.stack.pop();
      ctx.leave('Struct');
    },
  });
