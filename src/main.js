import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';

import App from '@/App.vue';

import 'virtual:windi.css';
import '@arco-design/web-vue/dist/arco.less';

const app = createApp(App);

app.use(ArcoVue);
app.use(ArcoVueIcon);
app.use(createPinia());

app.mount('#app');
