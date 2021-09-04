import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { StateInterface } from '../store';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route<StateInterface>(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    ),
  });

  Router.beforeEach(async (to, from, next) => {
    if (to.path === '/') {
      const { roomId } = to.query;
      if (roomId) {
        const request = new Request(
          `https://dialguiba.tech/WebRTCAppEE/rest/v2/broadcasts/conference-rooms/${
            roomId as string
          }`,
          {
            headers: {
              Authorization:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.dnwd9sjQmEAyWWpbaGWA9R6pW4Qxu5eYES9Xrpl5UsY',
            },
          }
        );
        const res = await fetch(request);
        console.log(res, '*️⃣*️⃣*️⃣*️⃣');
        if (res.status === 200) {
          next();
        } else if (res.status === 404) {
          next({
            path: '/error',
            query: { errorMessage: 'Meeting not found' },
          });
        } else if (res.status === 403) {
          next({
            path: '/error',
            query: { errorMessage: 'Not allowed' },
          });
        }
      } else {
        next({
          path: '/error',
          query: {
            errorMessage: 'Please, provide a Room ID',
          },
        });
      }
    } else {
      next();
    }
  });

  return Router;
});
