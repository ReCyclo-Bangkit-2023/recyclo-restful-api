import type { ReqRefDefaults } from '@hapi/hapi/lib/types/request.js';
import type { ServerRoute } from '@hapi/hapi/lib/types/route.js';
import {
  addWaste,
  deleteWaste,
  getWastes,
  putWaste,
} from '../handlers/recyclo-handlers.js';

const routes: ServerRoute<ReqRefDefaults>[] = [
  {
    method: 'GET',
    path: '/api/wastes',
    handler: getWastes,
  },
  {
    method: 'POST',
    path: '/api/wastes',
    handler: addWaste,
  },
  {
    method: 'PUT',
    path: '/api/wastes/{wasteId}',
    handler: putWaste,
  },
  {
    method: 'DELETE',
    path: '/api/wastes/{wasteId}',
    handler: deleteWaste,
  },
];
export default routes;
