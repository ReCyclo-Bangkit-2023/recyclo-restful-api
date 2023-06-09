import type { ReqRefDefaults } from '@hapi/hapi/lib/types/request.js';
import type { ServerRoute } from '@hapi/hapi/lib/types/route.js';
import {
  confirmSellerTransaction,
  deleteTransaction,
  getTransactions,
  orderCompleteTransaction,
} from '../handlers/recyclo-handlers.js';

const routes: ServerRoute<ReqRefDefaults>[] = [
  {
    method: 'GET',
    path: '/api/transactions/{userId}',
    handler: getTransactions,
  },
  {
    method: 'PUT',
    path: '/api/transactions/{transactionId}/confirm-seller',
    handler: confirmSellerTransaction,
  },
  {
    method: 'PUT',
    path: '/api/transactions/{transactionId}/order-complete',
    handler: orderCompleteTransaction,
  },
  {
    method: 'DELETE',
    path: '/api/transactions/{transactionId}/cancel-order',
    handler: deleteTransaction,
  },
];
export default routes;
