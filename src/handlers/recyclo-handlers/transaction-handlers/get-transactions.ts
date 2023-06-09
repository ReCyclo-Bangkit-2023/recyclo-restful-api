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

const getTransactions = (request: Request, h: ResponseToolkit) => {
  const { userId } = request.params;
  const index = transactions.filter(
    (transaction) => transaction.userId === userId
  ); // memilih userId yang akan ditampilkan

  if (index) {
    return {
      status: 'success',
      data: {
        index,
      },
    };
  }
  const response = h.response({
    status: 'fail',
    message: 'transaction not found',
  });
  response.code(404);
  return response;
};

export default getTransactions;
