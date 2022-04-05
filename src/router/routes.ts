import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('layouts/FuMainLayout'),
    redirect: {
      name: 'prejoin',
    },
    children: [
      {
        path: 'prejoin',
        name: 'prejoin',
        component: () => import('pages/FuPrejoinPage'),
      },
      {
        path: 'meet',
        name: 'meet',
        component: () => import('pages/FuCooperate'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
