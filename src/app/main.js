import vue from 'vue';
import vueAxios from 'vue-axios'
import axios from 'axios';
import router from './router';
import App from './App.vue';
/* Token de autorización */
const token = localStorage.getItem('token');
/* -- Configuración Axios para todas las peticiones HTTP -- */
axios.defaults.baseURL = 'http://127.0.0.1:3000';
axios.defaults.headers.common['Authorization'] = (token) ? `Bearer ${token}` : null;

vue.use(vueAxios, axios);
new vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})