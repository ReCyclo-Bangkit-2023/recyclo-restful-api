import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import { Readable } from 'stream';
import NotFoundError from '../../../exception/not-found-error.js';
import ValidationError from '../../../exception/validation-error.js';
import compressBufferImgs from '../../../helpers/compress-buffer-imgs.js';
import createRecycledImgUrl from '../../../helpers/create-recycled-img-url.js';
import deleteImages from '../../../helpers/delete-images.js';
import sendImage from '../../../helpers/send-image.js';
import type { PutRecycledGoodsReqBodyProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const putRecycledGoods = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { userId } = request.auth.credentials as {
      userId: string;
    };

    const { recycledGoodsId } = request.params as {
      recycledGoodsId: string;
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
    } = request.payload as PutRecycledGoodsReqBodyProps;

    const recycledGoodsDocRef = firestoreDB
      .collection('recycledGoods')
      .doc(recycledGoodsId);

    const recycledGoodsDoc = await recycledGoodsDocRef.get();

    if (!recycledGoodsDoc.exists) {
      throw new NotFoundError('barang daur ulang tidak ditemukan');
    }

    const isNotBufferImgs =
      !Buffer.isBuffer(image1) ||
      !Buffer.isBuffer(image2) ||
      !Buffer.isBuffer(image3);

    if (isNotBufferImgs)
      throw new ValidationError('gambar tidak valid atau tidak lengkap');

    await deleteImages({
      recycledType: 'recycled-goods',
      userId,
      recycledId: recycledGoodsId,
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
        recycledType: 'recycled-goods',
        readableBfImg:
          compressedStreamImages[
            compressedStreamImgProp as keyof typeof compressedStreamImages
          ],
        userId,
        recycledId: recycledGoodsId,
        imageName: compressedStreamImgProp,
      });
    }

    const createRecycledGoodsImgUrl = createRecycledImgUrl({
      recycledType: 'recycled-goods',
      userId,
      recycledId: recycledGoodsId,
    });

    const updatedRecycledGoods = {
      title: title ? title : (recycledGoodsDoc.get('title') as string),
      price: price ? price : (recycledGoodsDoc.get('price') as number),
      kind: kind ? kind : (recycledGoodsDoc.get('kind') as string),
      amount: amount ? amount : (recycledGoodsDoc.get('amount') as number),
      desc: desc ? desc : (recycledGoodsDoc.get('desc') as string),
      image1: createRecycledGoodsImgUrl(1),
      image2: createRecycledGoodsImgUrl(2),
      image3: createRecycledGoodsImgUrl(3),
      lat: lat ? lat : (recycledGoodsDoc.get('lat') as string),
      long: long ? long : (recycledGoodsDoc.get('long') as string),
    };

    await recycledGoodsDocRef.update(updatedRecycledGoods);

    return h
      .response({
        error: false,
        message: 'success',
        data: updatedRecycledGoods,
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

export default putRecycledGoods;
