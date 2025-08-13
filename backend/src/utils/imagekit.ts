import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export default imagekit;

// Upload image function
export const uploadImage = async (
  file: Express.Multer.File,
  fileName: string,
  folder: string = 'products'
): Promise<{ url: string; fileId: string }> => {
  try {
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: fileName,
      folder: `ssecom/${folder}`,
      useUniqueFileName: true,
      transformation: {
        pre: 'q-80,f-auto', // Auto quality and format optimization
        post: [
          {
            type: 'transformation',
            value: 'w-800,h-800,c-maintain_ratio'
          }
        ]
      }
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

// Delete image function
export const deleteImage = async (fileId: string): Promise<void> => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error('Failed to delete image from ImageKit');
  }
};
