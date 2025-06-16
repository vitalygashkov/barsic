import { BuildingContext, ContextData, ParsingContext } from './context';
import { concatUint8Arrays } from './utils';

export type LengthFunc = (context: ContextData) => number;
export type Length = number | LengthFunc;

export interface PrivateSchema<T> {
  _parse(context: ParsingContext): T;
  _build(value: T, context: BuildingContext): void;
  [method: string]: any;
}

export interface PublicSchema<T> {
  parse(data: Uint8Array, debug?: boolean): T;
  build(obj: T, debug?: boolean): Uint8Array;
}

export type Schema<T> = {
  _name: string;
} & PrivateSchema<T> &
  PublicSchema<T>;

export function createSchema<T>(name: string, methods: PrivateSchema<T>): Schema<T> {
  return {
    ...methods,
    _name: name,
    parse(data: Uint8Array, debug: boolean = false): T {
      const context = new ParsingContext(new DataView(data.buffer, data.byteOffset, data.byteLength), 0, debug);
      context.enter(`TopLevel<${name}>`);
      const result = this._parse(context);
      context.leave(`TopLevel<${name}>`, result);
      return result;
    },
    build(obj: T, debug: boolean = false): Uint8Array {
      const context = new BuildingContext(undefined, debug);
      context.enter(`TopLevel<${name}>`, obj);
      this._build(obj, context);
      const finalBuffer = concatUint8Arrays(context.buffers);
      context.leave(`TopLevel<${name}>`, finalBuffer.length);
      return finalBuffer;
    },
  };
}
