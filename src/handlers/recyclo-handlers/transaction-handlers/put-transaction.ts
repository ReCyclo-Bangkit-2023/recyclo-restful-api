import { Request, ResponseToolkit } from '@hapi/hapi';

/*interface TransactionProps {
  transactionId: string;
  userId: string; // seller
  statusTransaction: string;
  date: string;
}*/

const transactions = [
  {
    transactionId: '001',
    userId: 'user1',
    statusTransaction: 'Berhasil Dikirim',
    date: new Date().toISOString(),
  },
  {
    transactionId: '002',
    userId: 'user2',
    statusTransaction: 'Belum Dikirim',
    date: new Date().toISOString(),
  },
];

export const confirmSellerTransaction = (
  request: Request,
  h: ResponseToolkit
) => {
  const { transactionId } = request.params;
  const { statusTransaction } = request.payload as {
    statusTransaction: string;
  };
  const transaction = transactions.find(
    (t) => t.transactionId === transactionId
  );
  if (transaction) {
    transaction.statusTransaction = statusTransaction;
    return {
      status: 'success',
      transactionId: transaction.transactionId,
      message: 'Seller transaction confirmed successfully',
    };
  }
  return h
    .response({
      status: 'fail',
      message: 'Transaction not found',
    })
    .code(404);
};

//orderCompleteTransaction
export const orderCompleteTransaction = (
  request: Request,
  h: ResponseToolkit
) => {
  const { transactionId } = request.params;
  const { id, statusOrder } = request.payload as {
    id: string;
    statusOrder: string;
  };
  const transaction = transactions.find(
    (t) => t.transactionId === transactionId
  );
  if (transaction) {
    transaction.statusTransaction = statusOrder; //kalau pembayaran sudah terverifikasi maka selesai
    return {
      status: 'success',
      transactionId: id,
      message: 'Order completed successfully',
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Order not found',
  });
  response.code(404);
  return response;
};
