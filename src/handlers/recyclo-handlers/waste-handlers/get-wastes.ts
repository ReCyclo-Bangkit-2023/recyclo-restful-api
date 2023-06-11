import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import type { WasteDocProps, WasteResBodyProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const getWastes = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { userId } = request.auth.credentials as {
    userId: string;
  };

  const wastesRef = firestoreDB.collection('wastes');
  const wasteSnapshotData: WasteDocProps[] = [];
  const wastesSnapshot = await wastesRef.where('userId', '==', userId).get();

  wastesSnapshot.forEach((doc) => {
    const wasteDocData = doc.data() as WasteDocProps;
    wasteSnapshotData.push(wasteDocData);
  });

  const wasteData: WasteResBodyProps[] = [];

  wasteSnapshotData.forEach((waste, idx) => {
    wasteData.push({
      key: idx + 1,
      ...waste,
    });
  });

  return h
    .response({
      error: false,
      message: 'success',
      data: wasteData,
    })
    .code(200);
};

export default getWastes;
