import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource/geologica'
import './style.css'
import App from './App.vue'
import router from './router'
import analyticsPlugin from './plugins/analytics'

const app = createApp(App)

app.use(createPinia())

app.use(router)

app.use(analyticsPlugin, {
    router,
    appName: 'SamySBH'
})

app.mount('#app')