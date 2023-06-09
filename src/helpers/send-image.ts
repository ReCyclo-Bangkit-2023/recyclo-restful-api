import { Storage } from '@google-cloud/storage';
import { Readable, pipeline } from 'node:stream';
import config from '../config/config.js';

interface SendImageProps {
  recycledType: 'recycled-goods' | 'recycled-waste';
  readableBfImg: Readable;
  userId: string;
  recycledId: string;
  imageName: string;
}

const storage = new Storage();

const sendImage = ({
  recycledType,
  readableBfImg,
  userId,
  recycledId,
  imageName,
}: SendImageProps) =>
  new Promise<void>((resolve, reject) => {
    pipeline(
      readableBfImg,
      storage
        .bucket(config.CLOUD_STORAGE_BUCKET_NAME)
        .file(`${recycledType}/${userId}/${recycledId}/${imageName}.jpeg`)
        .createWriteStream(),
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });

export default sendImage;
