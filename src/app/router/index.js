/* ---------------- ENRUTADOR ----------------- */
import vue from 'vue';
import vueRouter from 'vue-router';
vue.use(vueRouter);

/* Componentes */
import Login from '../components/Login.vue';
import Home from '../components/Home.vue';
import About from '../components/About.vue';
import Play from '../components/Play.vue';

const routes = [
    {
        path: '/',
        name:'login',
        props: true,
        component: Login
    },
    {
        path: '/home',
        name: 'home',
        props: true,
        component: Home
    },
    {
        path: '/about',
        name: 'about',
        props: true,
        component: About
    },
    {
        path: '/play/:p1-vs-:p2',
        name: 'play',
        props: true,
        component: Play
    }
]

export default new vueRouter({
    mode: 'history',
    routes: routes
})