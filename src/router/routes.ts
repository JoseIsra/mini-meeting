import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/FuCooperate'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/error',
    component: () => import('pages/FuError'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
