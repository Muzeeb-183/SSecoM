// backend/src/utils/imagekit.ts - ENHANCED WITH CATEGORY SUPPORT

import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export default imagekit;

// ✅ ENHANCED: Upload image function with category support
export const uploadImage = async (
  file: Express.Multer.File,
  fileName: string,
  folder: string = 'products'
): Promise<{ url: string; fileId: string }> => {
  try {
    let transformationConfig;
    
    if (folder === 'profiles') {
      transformationConfig = {
        pre: 'q-90,f-auto', 
        post: [
          {
            type: 'transformation' as const,
            value: 'w-300,h-300,c-force,bg-FFFFFF,r-max'
          }
        ]
      };
    } else if (folder === 'categories') {
      // ✅ NEW: Category-specific transformations for thumbnails
      transformationConfig = {
        pre: 'q-85,f-auto',
        post: [
          {
            type: 'transformation' as const,
            value: 'w-400,h-300,c-maintain_ratio,bg-FFFFFF'
          }
        ]
      };
    } else {
      // Default configuration for products
      transformationConfig = {
        pre: 'q-80,f-auto',
        post: [
          {
            type: 'transformation' as const,
            value: 'w-800,h-800,c-maintain_ratio'
          }
        ]
      };
    }

    const result = await imagekit.upload({
      file: file.buffer,
      fileName: fileName,
      folder: `ssecom/${folder}`, // Will create: ssecom/categories/
      useUniqueFileName: true,
      transformation: transformationConfig
    });

    return {
      url: result.url,
      fileId: result.fileId
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image to ImageKit');
  }
};

// Delete image function (unchanged)
export const deleteImage = async (fileId: string): Promise<void> => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error('Failed to delete image from ImageKit');
  }
};
