import { BuildingContext, ContextData, ParsingContext } from './context';
import { concatUint8Arrays } from './utils';

export type LengthFunc = (context: ContextData) => number;
export type Length = number | LengthFunc;

export interface PrivateSchema<T> {
  _parse(context: ParsingContext): T;
  _build(value: T, context: BuildingContext): void;
}

export interface PublicSchema<T> {
  parse(data: Uint8Array, debug?: boolean): T;
  build(obj: T, debug?: boolean): Uint8Array;
}

export type Schema<T> = {
  parse(data: Uint8Array, debug?: boolean): T;
  build(obj: T, debug?: boolean): Uint8Array;
} & PrivateSchema<T>;

export type InferSchema<T> = T extends Schema<infer U> ? U : never;

export function createSchema<T, K>(
  name: string,
  methods: {
    _parse(context: ParsingContext): T;
    _build(value: T, context: BuildingContext): void;
  },
  extensions?: K
) {
  return {
    ...methods,
    parse(data: Uint8Array, debug: boolean = false): T {
      const context = new ParsingContext(new DataView(data.buffer, data.byteOffset, data.byteLength), 0, debug);
      context.enter(`TopLevel<${name}>`);
      const result = methods._parse(context);
      context.leave(`TopLevel<${name}>`, result);
      return result;
    },
    build(obj: T, debug: boolean = false): Uint8Array {
      const context = new BuildingContext(undefined, debug);
      context.enter(`TopLevel<${name}>`, obj);
      methods._build(obj, context);
      const finalBuffer = concatUint8Arrays(context.buffers);
      context.leave(`TopLevel<${name}>`, finalBuffer.length);
      return finalBuffer;
    },
    ...extensions,
  } as Schema<T> & K;
}
