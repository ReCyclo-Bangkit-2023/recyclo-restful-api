import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import NotFoundError from '../../../exception/not-found-error.js';
import type {
  ItemCartDocProps,
  RecycledItem,
  UserDataDocProps,
} from '../../../types/types.js';

const firestoreDB = new Firestore();

const addItemCart = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  try {
    const { userId } = request.auth.credentials as {
      userId: string;
    };

    const { recycledId } = request.payload as {
      recycledId: string;
    };

    const itemCartsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_CARTS_COLLECTION
    );

    const itemCartDocsSnapshot = await itemCartsRef
      .where('userId', '==', userId)
      .where('recycledId', '==', recycledId)
      .get();

    const itemCartDocsData: ItemCartDocProps[] = [];

    itemCartDocsSnapshot.forEach((itemCartDoc) => {
      itemCartDocsData.push(itemCartDoc.data() as ItemCartDocProps);
    });

    const itemCartDocData = itemCartDocsData[0];

    if (itemCartDocsSnapshot.size === 1) {
      await itemCartsRef.doc(itemCartDocData.id).update({
        amount: itemCartDocData.amount + 1,
      });

      return h
        .response({
          error: false,
          message: 'success',
          data: {
            id: itemCartDocData.id,
          },
        })
        .code(200);
    }

    // Get recycled item data
    const recycledItemsRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION
    );

    const recycledItemDocRef = recycledItemsRef.doc(recycledId);
    const recycledItemDocSnapshot = await recycledItemDocRef.get();

    if (!recycledItemDocSnapshot.exists)
      throw new NotFoundError(
        'id barang atau sampah daur ulang tidak ditemukan'
      );

    const recycledItemDocData = recycledItemDocSnapshot.data() as RecycledItem;

    // Get user city field
    const usersRef = firestoreDB.collection(
      config.CLOUD_FIRESTORE_USERS_COLLECTION
    );

    const userDocRef = usersRef.doc(recycledItemDocData.userId);
    const userDocSnapshot = await userDocRef.get();

    if (!userDocSnapshot.exists)
      throw new NotFoundError('id user tidak ditemukan');

    const userDocData = userDocSnapshot.data() as UserDataDocProps;

    // Create new item cart
    const itemCartDocRef = itemCartsRef.doc();
    const itemCartId = itemCartDocRef.id;

    const newCartData: ItemCartDocProps = {
      id: itemCartId,
      userId,
      recycledId,
      image: recycledItemDocData.image1,
      title: recycledItemDocData.title,
      price: recycledItemDocData.price,
      city: userDocData.city,
      amount: 1,
    };

    await itemCartDocRef.set(newCartData);

    return h
      .response({
        error: false,
        message: 'success',
        data: {
          id: itemCartId,
        },
      })
      .code(201);
  } catch (error) {
    return h
      .response({
        error: true,
        message: (error as Error).message,
        data: {},
      })
      .code(500);
  }
};

export default addItemCart;
