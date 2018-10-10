import vue from 'vue';
import vueAxios from 'vue-axios'
import axios from 'axios';
import router from './router';
import App from './App.vue';
vue.use(vueAxios, axios);

new vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})