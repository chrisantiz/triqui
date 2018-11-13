/* ---------------- ENRUTADOR ----------------- */
import vue from 'vue';
import vueRouter from 'vue-router';
import swal from 'sweetalert';
import { authorization, invalidTokenAlert } from './functions';
vue.use(vueRouter);

/* Componentes */
import Login from '../components/Login.vue';
import Home from '../components/Home.vue';
import Play from '../components/Play.vue';

const routes = [
    {
        path: '/',
        name:'login',
        props: true,
        component: Login,
        meta: {
            auth: false
        }
    },
    {
        path: '/home',
        name: 'home',
        props: true,
        component: Home,
        meta: {
            auth: true
        }
    },
    {
        path: '/play/:p1-vs-:p2',
        name: 'play',
        props: true,
        component: Play,
        meta: {
            auth: true
        }
    }
]

const router = new vueRouter({
    mode: 'history',
    routes
})
/*
    Saber cuáles rutas están protegidas para autenticarse
    Identificar si se carga una ruta protegida desde la url o si es enviado desde otra página
    Si se envía desde otra página es porque ya se autenticó
    En la ruta «/play» comprobar si el item «userData» está en el localStorage. Si es así obtener los datos del usuario de ahí, sino, hacer una petición asíncrona.
 */

// router.beforeEach( async(to, from, next) => {
//     /* ------ RUTAS PROTEGIDAS ------ */
//     if (to.meta.auth) {
//         if (to.params.redirected) {
//             next();
//         } else {
//             /* ------------------------------------------------ */

//             /* Cuando se está yendo a una partida */
//             if (to.name === 'play') {
//                 const userData = localStorage.getItem('userData');
//                 /* Es porque van para una partida por primera vez */
//                 if (userData) {
//                     console.log('Mediante «userData»');
//                     return next({
//                         name: 'play',
//                         params: {
//                             p1: to.params.p1,
//                             p2: to.params.p2,
//                             data: JSON.parse(userData),
//                             redirected: true
//                         },
//                         query: {
//                             id: to.query.id
//                         }
//                     });
//                 }
//                 /* Cuando se intenta entrar directamente a la URL de la partida */
//                 try {
//                     console.log('Mediante «token»');
//                     let res = await authorization(vue.axios);
//                     /* Logeado y con partida activa */
//                     if (res.entry && res.gameUrl) {
//                         console.log('Debería entrar acá');
//                         console.log(res.data);
//                         return next({
//                             name: 'play',
//                             params: {
//                                 p1: to.params.p1,
//                                 p2: to.params.p2,
//                                 data: res.data,
//                                 redirected: true
//                             },
//                             query: {
//                                 id: to.query.id
//                             }
//                         });
//                     }
//                     /* Validar cosas como: */
//                     /* Usuario a entrar sea uno de los dos jugadores */
//                     /* Mostrar aletras cuando pase eso, y cuando la partida ya no esté activa */
//                 } catch (err) {
//                     /* Mientras */
//                     console.log(err);
//                 }
//             }

//             /* ----------------------------------------------- */
//             try {
//                 const res = await authorization(vue.axios);
//                 /* Si hay un usuario logeado */
//                 if (res.entry) {
//                     /* Comprobar si hay una partida activa */
//                     if (res.gameUrl) {
//                         /* Redirigir */
//                         window.location.href = res.gameUrl;
//                     } else {
//                         /* Cargar la página principal del usuario */
//                         next({ name: 'home', params: { data: res.data, redirected: true } });
//                     }
//                 } else {
                    // /* Cuando el token es inválido */
                    // if (res.status === 401) {
                    //     invalidTokenAlert(next);
                    // } else {
                    //     /* Cuando solo no está logeado, renderizar la vista */
                    //     next({ name: 'login' });
                    // }
//                 }
//             } catch (err) {
//                 console.log(err);
//             }
//         }
//     /* ---- RUTAS PÚBLICAS ---- */
//     } else {
//         try {
//             const res = await authorization(vue.axios);
//             /* Si hay un usuario logeado */
//             if (res.entry) {
//                 /* Comprobar si hay una partida activa */
//                 if (res.gameUrl) {
//                     window.location.href = res.gameUrl;
//                 } else {
//                     /* Cargar la página principal del usuario */
//                     next( { name: 'home', params: { data: res.data, redirected: true } } );
//                 }
//             } else {
//                 /* Cuando el token es inválido */
//                 if (res.status === 401) {
//                     invalidTokenAlert(next);
//                 } else {
//                     /* Cuando solo no está logeado, renderizar la vista */
//                     next();
//                 }
//             }
//         } catch (err) {
//             console.log(err);
//         }
//     }
// });

export default router;