import { Storage } from '@google-cloud/storage';
import config from '../config/config.js';

interface DeleteImageProps {
  isClient: boolean;
  recycledType: 'recycled-goods' | 'recycled-waste';
  userId: string;
  recycledId: string;
}

const storage = new Storage();

const deleteImages = async ({
  isClient,
  recycledType,
  userId,
  recycledId,
}: DeleteImageProps) => {
  const recycledGoodsImgs = (
    await storage.bucket(config.CLOUD_STORAGE_BUCKET_NAME).getFiles({
      delimiter: '/',
      prefix: `${
        isClient ? 'client' : 'ml'
      }/${recycledType}/${userId}/${recycledId}/`,
    })
  )[0];

  for (const recycledGoodsImg of recycledGoodsImgs) {
    await recycledGoodsImg.delete();
  }
};

export default deleteImages;
