import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import { Readable } from 'node:stream';
import ValidationError from '../../../exception/validation-error.js';
import compressBufferImgs from '../../../helpers/compress-buffer-imgs.js';
import createRecycledImgUrl from '../../../helpers/create-recycled-img-url.js';
import sendImage from '../../../helpers/send-image.js';
import type { AddWasteReqBodyProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const addWaste = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { userId } = request.auth.credentials as {
      userId: string;
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
    } = request.payload as AddWasteReqBodyProps;

    const isNotBufferImgs =
      !Buffer.isBuffer(image1) ||
      !Buffer.isBuffer(image2) ||
      !Buffer.isBuffer(image3);

    if (isNotBufferImgs)
      throw new ValidationError('gambar tidak valid atau tidak lengkap');

    const wastesRef = firestoreDB.collection('wastes');

    const wasteDocRef = wastesRef.doc();

    const wasteId = wasteDocRef.id;

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

    const newWasteData = {
      id: wasteId,
      userId,
      title,
      price,
      kind,
      amount,
      image1: createWasteImgUrl(1),
      image2: createWasteImgUrl(2),
      image3: createWasteImgUrl(3),
      desc,
      lat,
      long,
    };

    await wasteDocRef.set(newWasteData);

    return h
      .response({
        error: false,
        message: 'success',
        data: newWasteData,
      })
      .code(201);
  } catch (error) {
    if (error instanceof ValidationError) {
      return h.response({
        error: true,
        message: (error as Error).message,
        data: {},
      });
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

export default addWaste;
