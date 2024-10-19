import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import localesMsg from './locales'

const app = createApp(App)

const i18n = createI18n({
  locale: 'zh-CN',
  legacy: false,
  fallbackLocale: 'en',
  messages: localesMsg
})

app.use(i18n)
app.mount('#app')
