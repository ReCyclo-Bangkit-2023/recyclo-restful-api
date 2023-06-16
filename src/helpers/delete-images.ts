import { Storage } from '@google-cloud/storage';
import config from '../config/config.js';

interface DeleteImageProps {
  recycledType: 'recycled-goods' | 'recycled-waste';
  userId: string;
  recycledId: string;
}

const storage = new Storage();

const deleteImages = async ({
  recycledType,
  userId,
  recycledId,
}: DeleteImageProps) => {
  const recycledGoodsImgs = (
    await storage.bucket(config.CLOUD_STORAGE_BUCKET_NAME).getFiles({
      delimiter: '/',
      prefix: `${recycledType}/${userId}/${recycledId}/`,
    })
  )[0];

  for (const recycledGoodsImg of recycledGoodsImgs) {
    await recycledGoodsImg.delete();
  }
};

export default deleteImages;
