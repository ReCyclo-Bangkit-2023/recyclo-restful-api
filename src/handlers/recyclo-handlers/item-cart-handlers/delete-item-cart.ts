import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';

const firestoreDB = new Firestore();

const deleteItemCart = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { itemCartId } = request.params as {
      itemCartId: string;
    };

    const itemCartsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_CARTS_COLLECTION
    );

    const itemCartDocRef = itemCartsRef.doc(itemCartId);
    const itemCartDocSnapshot = await itemCartDocRef.get();

    if (!itemCartDocSnapshot.exists)
      throw new NotFoundError('id item cart tidak ditemukan');

    await itemCartDocRef.delete();

    return h
      .response({
        error: false,
        message: 'success',
        data: {},
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

export default deleteItemCart;
