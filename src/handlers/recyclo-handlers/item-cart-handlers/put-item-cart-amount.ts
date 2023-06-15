import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import type { ItemCartDocProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const putItemCartAmount = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { itemCartId } = request.params as {
      itemCartId: string;
    };

    const { operation } = request.query as {
      operation: 'plus' | 'min';
    };

    const itemCartsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_CARTS_COLLECTION
    );

    const itemCartDocRef = itemCartsRef.doc(itemCartId);
    const itemCartDocSnapshot = await itemCartDocRef.get();

    if (!itemCartDocSnapshot.exists)
      throw new NotFoundError('id item cart tidak ditemukan');

    const itemCartDocData = itemCartDocSnapshot.data() as ItemCartDocProps;

    let updatedAmount = 1;

    if (operation === 'plus') {
      updatedAmount = itemCartDocData.amount + 1;
      await itemCartDocRef.update({
        amount: updatedAmount,
      });
    } else if (operation === 'min') {
      if (itemCartDocData.amount - 1 > 0) {
        updatedAmount = itemCartDocData.amount - 1;
        await itemCartDocRef.update({
          amount: updatedAmount,
        });
      } else {
        await itemCartDocRef.delete();

        return h
          .response({
            error: false,
            message: 'success',
            data: {
              amount: 0,
            },
          })
          .code(200);
      }
    } else {
      throw new Error('operasi jumlah amount tidak valid');
    }

    return h
      .response({
        error: false,
        message: 'success',
        data: {
          amount: updatedAmount,
        },
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

export default putItemCartAmount;
