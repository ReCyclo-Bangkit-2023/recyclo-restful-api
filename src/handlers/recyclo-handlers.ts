import login from './recyclo-handlers/login.js';
import addRecycledGoods from './recyclo-handlers/recycled-goods-handlers/add-recycled-goods.js';
import deleteRecycledGoods from './recyclo-handlers/recycled-goods-handlers/delete-recycled-goods.js';
import getAllRecycledGoods from './recyclo-handlers/recycled-goods-handlers/get-all-recycled-goods.js';
import putRecycledGoods from './recyclo-handlers/recycled-goods-handlers/put-recycled-goods.js';
import register from './recyclo-handlers/register.js';
import addWaste from './recyclo-handlers/waste-handlers/add-waste.js';
import deleteWaste from './recyclo-handlers/waste-handlers/delete-waste.js';
import getWastes from './recyclo-handlers/waste-handlers/get-wastes.js';
import putWaste from './recyclo-handlers/waste-handlers/put-waste.js';

export {
  addRecycledGoods,
  addWaste,
  deleteRecycledGoods,
  deleteWaste,
  getAllRecycledGoods,
  getWastes,
  login,
  putRecycledGoods,
  putWaste,
  register,
};
