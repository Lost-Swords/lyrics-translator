import { fileURLToPath, URL } from 'node:url'
import { translateApis } from './src/utils/translate-keys'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

//动态添加proxys代理
let proxys :  { [key: string]: any } = {}
Object.entries(translateApis).forEach(([k, v]) => {
  proxys[`/${v.name}`] = {
    target: v.url,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(new RegExp("^\\/" + v.name), ""),
  }
});
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: "docs"
  },
  plugins: [
    vue(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/, /\.vue\?vue/, // .vue
        /\.md$/, // .md
        "env.d.ts", "src/**/*", "src/**/*.vue", "types/components.d.ts", "types/auto-imports.d.ts"
      ],
      dts:"src/auto-import.d.ts",
      imports: [
        'vue'
      ]
    }),
    Components({
      resolvers: [NaiveUiResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host:'localhost',
    port: 7081,//本机端口
    proxy: proxys
  },
})
