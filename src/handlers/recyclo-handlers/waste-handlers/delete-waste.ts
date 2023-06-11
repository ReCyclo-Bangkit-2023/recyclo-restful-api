import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import deleteImages from '../../../helpers/delete-images.js';

const firestoreDB = new Firestore();

const deleteWaste = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { userId } = request.auth.credentials as {
    userId: string;
  };

  const { wasteId } = request.params as {
    wasteId: string;
  };

  const wasteDocRef = firestoreDB.collection('wastes').doc(wasteId);

  const wasteDoc = await wasteDocRef.get();

  if (wasteDoc.exists) {
    await deleteImages({
      recycledType: 'recycled-waste',
      userId,
      recycledId: wasteId,
    });
  }

  await wasteDocRef.delete();

  return h
    .response({
      error: false,
      message: 'success',
      data: {},
    })
    .code(200);
};

export default deleteWaste;
