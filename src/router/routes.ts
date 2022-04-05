import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    // component: () => import('layouts/FuMainLayout'),
    component: () => import('pages/FuCooperate'),
  },
  //   redirect: {
  //     name: 'prejoin',
  //   },
  //   children: [
  //     {
  //       path: 'prejoin',
  //       name: 'prejoin',
  //     },
  //     {
  //       path: 'meet',
  //       name: 'meet',
  //       component: () => import('pages/FuCooperate'),
  //     },
  //   ],
  // },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
