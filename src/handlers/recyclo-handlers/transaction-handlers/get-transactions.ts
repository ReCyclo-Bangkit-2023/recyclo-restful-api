import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import type { TransactionDocProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const getTransactions = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { userId } = request.auth.credentials as {
    userId: string;
  };

  const transactionsRef = firestoreDB.collection(
    config.CLOUD_FIRESTORE_TRANSACTIONS_COLLECTION
  );

  const transactionSnapshot = await transactionsRef
    .where('userId', '==', userId)
    .get();

  const transactionDocsData: TransactionDocProps[] = [];

  transactionSnapshot.forEach((transactionDoc) => {
    const transactionDocData = transactionDoc.data() as TransactionDocProps;

    transactionDocsData.push(transactionDocData);
  });

  const transactionData: (TransactionDocProps & {
    key: number;
  })[] = [];

  transactionDocsData.forEach((transactionDoc, idx) => {
    transactionData.push({
      key: idx + 1,
      ...transactionDoc,
    });
  });

  return h.response({
    error: false,
    message: 'success',
    data: transactionData,
  });
};

export default getTransactions;
