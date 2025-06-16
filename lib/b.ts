import { string } from './schemas/string';
import { uint8 } from './schemas/uint8';
import { uint16 } from './schemas/uint16';
import { uint32 } from './schemas/uint32';
import { literal } from './schemas/literal';
import { object } from './schemas/object';
import { array } from './schemas/array';
import { variant } from './schemas/variant';
import { bytes } from './schemas/bytes';
import { hex } from './schemas/hex';
import { base64 } from './schemas/base64';
import { sized } from './schemas/sized';
import { prefixed } from './schemas/prefixed';
import { greedyRange } from './schemas/greedy-range';

export const b = {
  string,
  uint8,
  uint16,
  uint32,
  literal,
  object,
  array,
  variant,
  bytes,
  hex,
  base64,
  sized,
  prefixed,
  greedyRange,
};
