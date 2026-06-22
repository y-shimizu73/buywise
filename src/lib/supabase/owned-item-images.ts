import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_OWNED_ITEM_IMAGE_TYPES,
  MAX_OWNED_ITEM_IMAGE_BYTES,
  MAX_OWNED_ITEM_IMAGES_FOR_AI,
  OWNED_ITEM_IMAGES_BUCKET,
} from "@/lib/owned-item-image-constants";

export {
  MAX_OWNED_ITEM_IMAGE_BYTES,
  OWNED_ITEM_IMAGES_BUCKET,
} from "@/lib/owned-item-image-constants";

const ALLOWED_IMAGE_TYPES = new Set<string>(ALLOWED_OWNED_ITEM_IMAGE_TYPES);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type OwnedItemInlineImage = {
  inlineData: {
    mimeType: string;
    data: string;
  };
};

export function validateOwnedItemImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("JPEG / PNG / WebP 形式の画像のみアップロードできます");
  }

  if (file.size > MAX_OWNED_ITEM_IMAGE_BYTES) {
    throw new Error("画像は 4MB 以下にしてください");
  }
}

function getExtension(mimeType: string) {
  return EXTENSION_BY_MIME[mimeType] ?? "jpg";
}

export async function uploadOwnedItemImage(userId: string, file: File) {
  validateOwnedItemImage(file);

  const supabase = await createClient();
  const path = `${userId}/${crypto.randomUUID()}.${getExtension(file.type)}`;

  const { error } = await supabase.storage
    .from(OWNED_ITEM_IMAGES_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);
  return path;
}

export async function deleteOwnedItemImage(path: string | null | undefined) {
  if (!path) return;

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(OWNED_ITEM_IMAGES_BUCKET)
    .remove([path]);

  if (error) throw new Error(error.message);
}

export async function getOwnedItemImageSignedUrl(
  path: string,
  expiresIn = 60 * 60,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(OWNED_ITEM_IMAGES_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function downloadOwnedItemImageForAi(
  path: string,
): Promise<OwnedItemInlineImage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(OWNED_ITEM_IMAGES_BUCKET)
    .download(path);

  if (error || !data) return null;

  const buffer = Buffer.from(await data.arrayBuffer());
  return {
    inlineData: {
      mimeType: data.type || "image/jpeg",
      data: buffer.toString("base64"),
    },
  };
}

export async function downloadOwnedItemImagesForAi(
  paths: string[],
): Promise<OwnedItemInlineImage[]> {
  const limitedPaths = paths.slice(0, MAX_OWNED_ITEM_IMAGES_FOR_AI);
  const images = await Promise.all(
    limitedPaths.map((path) => downloadOwnedItemImageForAi(path)),
  );

  return images.filter((image): image is OwnedItemInlineImage => image !== null);
}
