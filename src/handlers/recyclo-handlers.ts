import login from './recyclo-handlers/login.js';
import addRecycledGoods from './recyclo-handlers/recycled-goods-handlers/add-recycled-goods.js';
import deleteRecycledGoods from './recyclo-handlers/recycled-goods-handlers/delete-recycled-goods.js';
import getAllRecycledGoods from './recyclo-handlers/recycled-goods-handlers/get-all-recycled-goods.js';
import putRecycledGoods from './recyclo-handlers/recycled-goods-handlers/put-recycled-goods.js';
import register from './recyclo-handlers/register.js';

export {
  register,
  login,
  getAllRecycledGoods,
  addRecycledGoods,
  putRecycledGoods,
  deleteRecycledGoods,
};
