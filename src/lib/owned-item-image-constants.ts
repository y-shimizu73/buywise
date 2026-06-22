export const OWNED_ITEM_IMAGES_BUCKET = "owned-item-images";
export const MAX_OWNED_ITEM_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_OWNED_ITEM_IMAGES_FOR_AI = 10;

export const ALLOWED_OWNED_ITEM_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
