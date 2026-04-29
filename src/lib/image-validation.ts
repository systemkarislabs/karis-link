const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const BASE64_IMAGE_PAYLOAD = /^[A-Za-z0-9+/]+={0,2}$/;

function estimateBase64Bytes(base64Payload: string) {
  const padding = base64Payload.endsWith('==') ? 2 : base64Payload.endsWith('=') ? 1 : 0;
  return Math.floor((base64Payload.length * 3) / 4) - padding;
}

function hasValidMagicBytes(buffer: Buffer, mimeType: string) {
  if (mimeType === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === 'image/webp') {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }

  return false;
}

export function validateImageFile(file: File) {
  if (!file || file.size === 0) return;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Use uma imagem JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('A imagem deve ter no maximo 2 MB.');
  }
}

export function validateImageBuffer(buffer: Buffer, mimeType: string) {
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new Error('Use uma imagem JPG, PNG ou WEBP.');
  }

  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error('A imagem deve ter no maximo 2 MB.');
  }

  if (!hasValidMagicBytes(buffer, mimeType)) {
    throw new Error('O arquivo enviado nao parece ser uma imagem valida.');
  }
}

export function validateImageDataUrl(dataUrl: string) {
  if (!dataUrl) return;

  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error('Formato de imagem invalido.');
  }

  const mimeType = match[1];
  const payload = match[2];

  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new Error('Use uma imagem JPG, PNG ou WEBP.');
  }

  if (!BASE64_IMAGE_PAYLOAD.test(payload) || payload.length % 4 !== 0) {
    throw new Error('Formato de imagem invalido.');
  }

  if (estimateBase64Bytes(payload) > MAX_IMAGE_BYTES) {
    throw new Error('A imagem deve ter no maximo 2 MB.');
  }

  validateImageBuffer(Buffer.from(payload, 'base64'), mimeType);
}
