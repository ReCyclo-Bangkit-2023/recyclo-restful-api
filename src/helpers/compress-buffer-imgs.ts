import sharp from 'sharp';

const compressBufferImgs = async (
  bufferImgs: [Buffer, Buffer, Buffer],
  quality = 80
) => {
  const compressedImagesResult: Buffer[] = [];

  for (const image of bufferImgs) {
    const compressedImg = await sharp(image)
      .jpeg({ quality, force: true })
      .toBuffer();

    compressedImagesResult.push(compressedImg);
  }

  return {
    compressedBfImage1: compressedImagesResult[0],
    compressedBfImage2: compressedImagesResult[1],
    compressedBfImage3: compressedImagesResult[2],
  };
};

export default compressBufferImgs;
