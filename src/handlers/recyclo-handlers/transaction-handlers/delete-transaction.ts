import { Request, ResponseToolkit } from '@hapi/hapi';
interface TransactionProps {
  transactionId: string;
  userId: string;
  title: string;
  fee: number;
  itemPrice: number;
  amount: number;
  statusTransaction: string;
  date: string;
}
const transactions: TransactionProps[] = [
  {
    transactionId: '001',
    userId: 'user1',
    title: 'Kerajinan Rotan',
    fee: 5000,
    itemPrice: 1000000,
    amount: 1005000,
    statusTransaction: 'Delivered',
    date: new Date().toISOString(),
  },
  {
    transactionId: '002',
    userId: 'user2',
    title: 'Kerajinan Plastik',
    fee: 5000,
    itemPrice: 50000,
    amount: 55000,
    statusTransaction: 'In Delivery Process',
    date: new Date().toISOString(),
  },
];

const deleteTransaction = (request: Request, h: ResponseToolkit) => {
  const { transactionId } = request.params;
  const index = transactions.findIndex(
    (transaction) => transaction.transactionId === transactionId
  );

  if (index !== -1) {
    const deletedTransaction = transactions[index];
    transactions.splice(index, 1);
    const response = h.response({
      transactionId: deletedTransaction.transactionId,
      status: 'Success',
      message: 'Transaction canceled successfully',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'Fail',
    message: 'Transaction failed to cancel, ID not found',
  });
  response.code(404);
  return response;
};

export default deleteTransaction;
