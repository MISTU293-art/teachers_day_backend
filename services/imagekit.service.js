const ImageKit = require('imagekit');
const env = require('../config/env.config');

let imagekitInstance = null;

const getImageKit = () => {
  if (!imagekitInstance) {
    if (!env.imagekit.publicKey || !env.imagekit.privateKey || !env.imagekit.urlEndpoint) {
      console.warn('[ImageKit] Credentials not configured. Image uploads will fail.');
      return null;
    }
    imagekitInstance = new ImageKit({
      publicKey: env.imagekit.publicKey,
      privateKey: env.imagekit.privateKey,
      urlEndpoint: env.imagekit.urlEndpoint
    });
  }
  return imagekitInstance;
};

/**
 * Upload image buffer to ImageKit
 */
const uploadImage = async (fileBuffer, fileName, folder = '/teachers-day-2026') => {
  const ik = getImageKit();
  if (!ik) {
    throw new Error('ImageKit not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT in .env');
  }

  const result = await ik.upload({
    file: fileBuffer.toString('base64'),
    fileName: fileName,
    folder: folder,
    useUniqueFileName: true
  });

  return {
    url: result.url,
    fileId: result.fileId,
    thumbnailUrl: result.thumbnailUrl || result.url,
    name: result.name
  };
};

/**
 * Delete image from ImageKit by fileId
 */
const deleteImage = async (fileId) => {
  const ik = getImageKit();
  if (!ik) {
    throw new Error('ImageKit not configured.');
  }
  await ik.deleteFile(fileId);
};

/**
 * Get client-side auth parameters (for direct browser uploads if needed)
 */
const getAuthParams = () => {
  const ik = getImageKit();
  if (!ik) return null;
  return ik.getAuthenticationParameters();
};

module.exports = {
  uploadImage,
  deleteImage,
  getAuthParams,
  getImageKit
};
