import type { ReqRefDefaults } from '@hapi/hapi/lib/types/request.js';
import type { ServerRoute } from '@hapi/hapi/lib/types/route.js';
import Joi from 'joi';
import {
  addItemCart,
  addRecycledGoods,
  addTransactions,
  addWaste,
  confirmSellerTransaction,
  deleteItemCart,
  deleteRecycledGoods,
  deleteTransaction,
  deleteWaste,
  getAllRecycledGoods,
  getItemCarts,
  getRecycledItems,
  getTransactions,
  getWastes,
  login,
  orderCompleteTransaction,
  putItemCartAmount,
  putRecycledGoods,
  putWaste,
  register,
} from '../handlers/recyclo-handlers.js';

const routes: ServerRoute<ReqRefDefaults>[] = [
  {
    method: 'POST',
    path: '/register',
    options: {
      validate: {
        payload: Joi.object({
          fullname: Joi.string().trim().min(1).max(100),
          email: Joi.string().email(),
          password: Joi.string().min(8),
          address: Joi.string().min(1),
          city: Joi.string(),
          phoneNumber: Joi.string(),
        }),
      },
    },
    handler: register,
  },
  {
    method: 'POST',
    path: '/login',
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email(),
          password: Joi.string().min(8),
        }),
      },
    },
    handler: login,
  },
  {
    method: 'GET',
    path: '/api/recycled-items',
    handler: getRecycledItems,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'GET',
    path: '/api/recycled-goods',
    handler: getAllRecycledGoods,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'POST',
    path: '/api/recycled-goods',
    handler: addRecycledGoods,
    options: {
      auth: 'jwt-auth-bearer',
      payload: {
        parse: true,
        allow: 'multipart/form-data',
        multipart: { output: 'data' },
        maxBytes: 8388608,
      },
    },
  },
  {
    method: 'PUT',
    path: '/api/recycled-goods/{recycledGoodsId}',
    handler: putRecycledGoods,
    options: {
      auth: 'jwt-auth-bearer',
      payload: {
        parse: true,
        allow: 'multipart/form-data',
        multipart: { output: 'data' },
        maxBytes: 8388608,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/api/recycled-goods/{recycledGoodsId}',
    handler: deleteRecycledGoods,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'GET',
    path: '/api/wastes',
    handler: getWastes,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'POST',
    path: '/api/wastes',
    handler: addWaste,
    options: {
      auth: 'jwt-auth-bearer',
      payload: {
        parse: true,
        allow: 'multipart/form-data',
        multipart: { output: 'data' },
        maxBytes: 8388608,
      },
    },
  },
  {
    method: 'PUT',
    path: '/api/wastes/{wasteId}',
    handler: putWaste,
    options: {
      auth: 'jwt-auth-bearer',
      payload: {
        parse: true,
        allow: 'multipart/form-data',
        multipart: { output: 'data' },
        maxBytes: 8388608,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/api/wastes/{wasteId}',
    handler: deleteWaste,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'GET',
    path: '/api/item-carts',
    handler: getItemCarts,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'POST',
    path: '/api/item-carts',
    handler: addItemCart,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'PUT',
    path: '/api/item-carts/{itemCartId}',
    handler: putItemCartAmount,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'DELETE',
    path: '/api/item-carts/{itemCartId}',
    handler: deleteItemCart,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'GET',
    path: '/api/transactions',
    handler: getTransactions,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'POST',
    path: '/api/transactions',
    handler: addTransactions,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'PUT',
    path: '/api/transactions/{transactionId}/confirm-seller',
    handler: confirmSellerTransaction,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'PUT',
    path: '/api/transactions/{transactionId}/order-complete',
    handler: orderCompleteTransaction,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
  {
    method: 'DELETE',
    path: '/api/transactions/{transactionId}/cancel-order',
    handler: deleteTransaction,
    options: {
      auth: 'jwt-auth-bearer',
    },
  },
];
export default routes;
