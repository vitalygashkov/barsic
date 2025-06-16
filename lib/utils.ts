const fromTextToBuffer = (input: Parameters<typeof TextEncoder.prototype.encode>['0']) =>
  new TextEncoder().encode(input);

const fromBufferToText = (input: Parameters<typeof TextDecoder.prototype.decode>['0']) =>
  new TextDecoder().decode(input);

const fromBase64ToBuffer = (data: string) => Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

const parseHex = (hex: string) => hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16));

export const fromText = (data: string) => ({
  toBase64: () => {
    return btoa(fromTextToBuffer(data).reduce((s, byte) => s + String.fromCharCode(byte), ''));
  },
  toHex: () => {
    return Array.from(fromTextToBuffer(data))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  },
  toBuffer: () => fromTextToBuffer(data),
});

export const fromBinary = (data: string) => ({
  toBuffer: () => {
    const len = data.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) buffer[i] = data.charCodeAt(i);
    return buffer;
  },
});

export const fromBase64 = (data: string) => ({
  toBuffer: () => fromBase64ToBuffer(data),
  toText: () => fromBufferToText(fromBase64ToBuffer(data)),
  toHex: () => fromBuffer(fromBase64(data).toBuffer()).toHex(),
});

export const fromBuffer = (data: Uint8Array) => ({
  toBase64: () => {
    const binString = Array.from(data, (byte) => String.fromCodePoint(byte)).join('');
    return btoa(binString);
  },
  toHex: () => {
    return Array.from(data)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  },
  toText: () => fromBufferToText(data),
  toBinary: () => {
    let binary = '';
    const len = data.length;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(data[i]);
    return binary;
  },
});

export const fromHex = (data: string) => ({
  toBase64: () => {
    return btoa(String.fromCharCode(...parseHex(data)));
  },
  toBuffer: () => {
    return new Uint8Array(parseHex(data)) as unknown as Uint8Array;
  },
  toText: () => {
    return fromBufferToText(new Uint8Array(parseHex(data)));
  },
});

export const parseBufferSource = (data: BufferSource) => {
  if (data instanceof Uint8Array) return data;
  return data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer);
};

export const compareArrays = (arr1: Uint8Array, arr2: Uint8Array) => {
  if (arr1.length !== arr2.length) return false;
  return Array.from(arr1).every((value, index) => value === arr2[index]);
};

export const bytesToString = (bytes: Uint8Array) => {
  return String.fromCharCode.apply(null, Array.from(bytes));
};

export const bytesToBase64 = (uint8array: Uint8Array) => {
  return btoa(String.fromCharCode.apply(null, Array.from(uint8array)));
};

export const stringToBytes = (string: string) => {
  return Uint8Array.from(string.split('').map((x) => x.charCodeAt(0)));
};

export const base64ToBytes = (base64_string: string) => {
  return Uint8Array.from(atob(base64_string), (c) => c.charCodeAt(0));
};

export const xorArrays = (arr1: Uint8Array, arr2: Uint8Array) => {
  return new Uint8Array(arr1.map((byte, i) => byte ^ arr2[i]));
};

export const getRandomBytes = (size: number) => {
  const randomBytes = new Uint8Array(size);
  crypto.getRandomValues(randomBytes);
  return randomBytes;
};

export const arraysEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
};

export const concatUint8Arrays = (arrays: Uint8Array[]) => {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};
