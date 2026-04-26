const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function estimateBase64Bytes(base64Payload: string) {
  const padding = base64Payload.endsWith('==') ? 2 : base64Payload.endsWith('=') ? 1 : 0;
  return Math.floor((base64Payload.length * 3) / 4) - padding;
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

  if (estimateBase64Bytes(payload) > MAX_IMAGE_BYTES) {
    throw new Error('A imagem deve ter no maximo 2 MB.');
  }
}
