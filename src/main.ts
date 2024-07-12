import { createApp } from 'vue'
import './style.css'
// 导入element-plus
import ElementPlus from 'element-plus'

//导入路由器
import router from "./router"
import NProgress from 'nprogress';
import {createPinia} from 'pinia'
import piniaPersist from 'pinia-plugin-persist'

import App from './App.vue'
import 'element-plus/dist/index.css'
import 'nprogress/nprogress.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const pinia = createPinia();
pinia.use(piniaPersist)

createApp(App)
.use(ElementPlus,{locale:zhCn})
.use(router)
.use(NProgress)
.use(pinia)
.mount('#app');
