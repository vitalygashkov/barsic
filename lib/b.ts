import { uint8, uint16, uint32, int8, int16, int32, int64, uint64, float16, float32, float64 } from './schemas/number';
import { string, base64, hex } from './schemas/string';
import { literal } from './schemas/literal';
import { object } from './schemas/object';
import { array } from './schemas/array';
import { discriminatedUnion } from './schemas/union';
import { bytes } from './schemas/bytes';
import { sized } from './schemas/sized';
import { prefixed } from './schemas/prefixed';
import { greedyRange } from './schemas/greedy-range';
import { InferSchema } from './schema';

export const b = {
  int8,
  uint8,
  int16,
  uint16,
  int32,
  uint32,
  int64,
  uint64,
  float16,
  float32,
  float64,

  string,
  base64,
  hex,

  bytes,
  literal,
  object,
  array,
  discriminatedUnion,
  sized,
  prefixed,
  greedyRange,
} as const;

export namespace b {
  export type infer<T> = InferSchema<T>;
}
