import { Schema, LengthFunc, createSchema } from '../schema';

export const array = <T>(subcon: Schema<T>, count: number | LengthFunc = 1) => {
  const schema = createSchema<T[]>(`List<${(subcon as any)._name}>`, {
    _parse: (ctx) => {
      const c = typeof count === 'function' ? count(ctx.context) : count;
      ctx.enter(`List(count=${c})`);
      const items: T[] = [];
      for (let i = 0; i < c; i++) {
        const itemContext = { ...ctx.context, _index: i };
        ctx.stack.push(itemContext);
        items.push(subcon._parse(ctx));
        ctx.stack.pop();
      }
      ctx.leave(`List(count=${c})`, items);
      return items;
    },
    _build: (values, ctx) => {
      ctx.enter(`List(count=${values.length})`, values);
      const c = typeof count === 'function' ? count(ctx.context) : count;
      if (values.length !== c) {
        throw new Error(`List length mismatch: expected ${c}, got ${values.length}`);
      }
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const itemContext = { ...ctx.context, _index: i };
        ctx.stack.push(itemContext);
        subcon._build(value, ctx);
        ctx.stack.pop();
      }
      ctx.leave(`List(count=${values.length})`, values.length);
    },
  });

  const extensions = {
    length: (value: number | LengthFunc) => {
      count = value;
      return schema;
    },
  };

  return {
    ...schema,
    ...extensions,
  } as Schema<T[]> & typeof extensions;
};
