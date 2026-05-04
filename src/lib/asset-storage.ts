import { randomBytes } from 'crypto';
import { validateImageBuffer, validateImageDataUrl, validateImageFile } from './image-validation';

type UploadInput = {
  folder: string;
  dataUrl?: string | null;
  file?: File | null;
};

type PreparedImage = {
  buffer: Buffer;
  mimeType: string;
};

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function getStorageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'karis-link-assets';

  if (!supabaseUrl || !serviceRoleKey) return null;

  return { supabaseUrl, serviceRoleKey, bucket };
}

function parseDataUrl(dataUrl: string): PreparedImage {
  validateImageDataUrl(dataUrl);

  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error('Formato de imagem invalido.');
  }

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  validateImageBuffer(buffer, mimeType);

  return { buffer, mimeType };
}

async function prepareImage({ dataUrl, file }: Pick<UploadInput, 'dataUrl' | 'file'>) {
  if (dataUrl) {
    return parseDataUrl(dataUrl);
  }

  if (file && file.size > 0) {
    validateImageFile(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    validateImageBuffer(buffer, file.type);
    return { buffer, mimeType: file.type };
  }

  return null;
}

function buildPublicUrl(supabaseUrl: string, bucket: string, objectPath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
}

export async function uploadPublicImage({ folder, dataUrl, file }: UploadInput) {
  const preparedImage = await prepareImage({ dataUrl, file });
  if (!preparedImage) return null;

  const storageConfig = getStorageConfig();

  // Fallback: if Supabase Storage is not configured, persist as inline base64 data URL.
  // This keeps image uploads working even without SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.
  if (!storageConfig) {
    console.warn('[asset-storage] Supabase Storage not configured — saving image as inline base64.');
    return `data:${preparedImage.mimeType};base64,${preparedImage.buffer.toString('base64')}`;
  }

  const { supabaseUrl, serviceRoleKey, bucket } = storageConfig;
  const extension = MIME_EXTENSIONS[preparedImage.mimeType] || 'webp';
  const safeFolder = folder.replace(/^\/+|\/+$/g, '');
  const objectPath = `${safeFolder}/${randomBytes(16).toString('hex')}.${extension}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': preparedImage.mimeType,
      'x-upsert': 'false',
    },
    body: new Blob([new Uint8Array(preparedImage.buffer)], { type: preparedImage.mimeType }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Nao foi possivel salvar a imagem no storage. ${details}`.trim());
  }

  return buildPublicUrl(supabaseUrl, bucket, objectPath);
}

export function isInlineDataImage(src: string | null | undefined) {
  return typeof src === 'string' && src.startsWith('data:image/');
}
