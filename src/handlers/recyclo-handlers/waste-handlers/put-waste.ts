import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import { Readable } from 'stream';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import ValidationError from '../../../exception/validation-error.js';
import compressBufferImgs from '../../../helpers/compress-buffer-imgs.js';
import createRecycledImgUrl from '../../../helpers/create-recycled-img-url.js';
import deleteImages from '../../../helpers/delete-images.js';
import sendImage from '../../../helpers/send-image.js';
import type {
  PutWasteReqBodyProps,
  WasteDocProps,
} from '../../../types/types.js';

const firestoreDB = new Firestore();

const putWaste = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { userId } = request.auth.credentials as {
      userId: string;
    };

    const { wasteId } = request.params as {
      wasteId: string;
    };

    const {
      title,
      price,
      kind,
      amount,
      image1,
      image2,
      image3,
      desc,
      lat,
      long,
    } = request.payload as PutWasteReqBodyProps;

    const wasteDocRef = firestoreDB
      .collection(config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION)
      .doc(wasteId);

    const wasteDoc = await wasteDocRef.get();

    if (!wasteDoc.exists) {
      throw new NotFoundError('sampah daur ulang tidak ditemukan');
    }

    const isNotBufferImgs =
      !Buffer.isBuffer(image1) ||
      !Buffer.isBuffer(image2) ||
      !Buffer.isBuffer(image3);

    if (isNotBufferImgs)
      throw new ValidationError('gambar tidak valid atau tidak lengkap');

    await deleteImages({
      recycledType: 'recycled-waste',
      userId,
      recycledId: wasteId,
    });

    const { compressedBfImage1, compressedBfImage2, compressedBfImage3 } =
      await compressBufferImgs([image1, image2, image3], 20);

    const compressedStreamImages = {
      image1: Readable.from(compressedBfImage1),
      image2: Readable.from(compressedBfImage2),
      image3: Readable.from(compressedBfImage3),
    };

    for (const compressedStreamImgProp in compressedStreamImages) {
      await sendImage({
        recycledType: 'recycled-waste',
        readableBfImg:
          compressedStreamImages[
            compressedStreamImgProp as keyof typeof compressedStreamImages
          ],
        userId,
        recycledId: wasteId,
        imageName: compressedStreamImgProp,
      });
    }

    const createWasteImgUrl = createRecycledImgUrl({
      recycledType: 'recycled-waste',
      userId,
      recycledId: wasteId,
    });

    const updatedWaste: Omit<
      WasteDocProps,
      'id' | 'userId' | 'recycledType' | 'sold'
    > = {
      title: title ? title : (wasteDoc.get('title') as string),
      price: price ? price : (wasteDoc.get('price') as number),
      kind: kind ? kind : (wasteDoc.get('kind') as string),
      amount: amount ? amount : (wasteDoc.get('amount') as number),
      desc: desc ? desc : (wasteDoc.get('desc') as string),
      image1: createWasteImgUrl(1),
      image2: createWasteImgUrl(2),
      image3: createWasteImgUrl(3),
      lat: lat ? lat : (wasteDoc.get('lat') as string),
      long: long ? long : (wasteDoc.get('long') as string),
    };

    await wasteDocRef.update(updatedWaste);

    return h
      .response({
        error: false,
        message: 'success',
        data: updatedWaste,
      })
      .code(200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return h
        .response({
          error: true,
          message: error.message,
          data: {},
        })
        .code(404);
    }

    return h
      .response({
        error: true,
        message: (error as Error).message,
        data: {},
      })
      .code(500);
  }
};

export default putWaste;
