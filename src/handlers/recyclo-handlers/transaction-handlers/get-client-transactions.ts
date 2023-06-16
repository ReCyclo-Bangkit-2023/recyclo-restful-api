import { Firestore } from '@google-cloud/firestore';
import type { ReqRefDefaults, Request, ResponseToolkit } from '@hapi/hapi';
import config from '../../../config/config.js';
import type { TransactionClientDocProps } from '../../../types/types.js';

const firestoreDB = new Firestore();

const getClientTransactions = async (
  request: Request<ReqRefDefaults>,
  h: ResponseToolkit<ReqRefDefaults>
) => {
  const { userId } = request.auth.credentials as {
    userId: string;
  };

  const clientTransactionsRef = firestoreDB.collection(
    config.CLOUD_FIRESTORE_TRANSACTION_CLIENTS_COLLECTION
  );

  const clientTransactionSnapshot = await clientTransactionsRef.get();

  const clientTransactionDocsData: TransactionClientDocProps[] = [];

  clientTransactionSnapshot.forEach((clientTransactionDoc) => {
    const clientTransactionDocData =
      clientTransactionDoc.data() as TransactionClientDocProps;
    clientTransactionDocsData.push(clientTransactionDocData);
  });

  const clientTransactions: (TransactionClientDocProps & {
    key: number;
  })[] = [];

  clientTransactionDocsData
    .filter(
      (clientTransactionDocData) =>
        clientTransactionDocData.userDetails.userId === userId
    )
    .forEach((clientTransactionDoc, idx) => {
      clientTransactions.push({
        key: idx + 1,
        ...clientTransactionDoc,
      });
    });

  return h.response({
    error: false,
    message: 'success',
    data: clientTransactions,
  });
};

export default getClientTransactions;
