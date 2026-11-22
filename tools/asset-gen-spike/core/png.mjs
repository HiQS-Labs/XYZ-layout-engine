// Pure Web-Standard ESM PNG structural inspection and alpha evaluation (zero node:* dependencies)

const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n >>> 0;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = (0xedb88320 ^ (c >>> 1)) >>> 0;
      } else {
        c = (c >>> 1) >>> 0;
      }
    }
    table[n] = c;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = (CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)) >>> 0;
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function inspectPngHeader(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (u8.length < 33) {
    throw new Error('Invalid PNG bytes: too short');
  }
  for (let i = 0; i < 8; i++) {
    if (u8[i] !== PNG_SIGNATURE[i]) {
      throw new Error('Invalid PNG signature');
    }
  }
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const length = view.getUint32(8, false);
  const type = String.fromCharCode(u8[12], u8[13], u8[14], u8[15]);
  if (type !== 'IHDR' || length !== 13) {
    throw new Error('Invalid PNG IHDR chunk');
  }
  const chunkDataAndType = u8.subarray(12, 12 + 4 + length);
  const chunkCrc = view.getUint32(12 + 4 + length, false);
  if (crc32(chunkDataAndType) !== chunkCrc) {
    throw new Error('Invalid PNG IHDR checksum');
  }
  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  const bitDepth = u8[24];
  const colorType = u8[25];
  const compressionMethod = u8[26];
  const filterMethod = u8[27];
  const interlaceMethod = u8[28];

  return {
    width,
    height,
    bitDepth,
    colorType,
    compressionMethod,
    filterMethod,
    interlaceMethod,
    hasAlphaChannel: colorType === 4 || colorType === 6
  };
}

export function inspectAlphaFromImageData(imageData) {
  const { data, width, height } = imageData;
  if (!data || typeof width !== 'number' || typeof height !== 'number') {
    throw new TypeError('invalid ImageData');
  }
  let minAlpha = 255;
  let transparentPixels = 0;
  const totalPixels = width * height;
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i];
    if (a < minAlpha) minAlpha = a;
    if (a < 255) transparentPixels++;
  }
  const transparentPixelRatio = totalPixels > 0 ? transparentPixels / totalPixels : 0;
  const realAlpha = minAlpha < 255;
  return {
    width,
    height,
    minAlpha,
    transparentPixelRatio: Math.round(transparentPixelRatio * 1e6) / 1e6,
    hasAlphaChannel: true,
    realAlpha,
    verified: true
  };
}
