/* eslint-disable */
import Vue from 'vue';
import App from './App.vue';
import router from './router';

/* PUBLIC */
import './assets/reset.css';
import './assets/basic.css';

/* ELEMENTUI */
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI, { size: 'small' });

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
