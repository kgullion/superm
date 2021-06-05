import { defineConfig } from 'vite'
import importToCDN from 'vite-plugin-cdn-import'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    importToCDN({
      prodUrl: "//unpkg.com/{name}@{version}/{path}",
      modules: [
        {
            name: 'vue',
            var: 'Vue',
            path: `dist/vue.global.prod.js`,
        },
        {
          name: 'vis-data',
          var: 'vis',
          path: `peer/umd/vis-data.min.js`,
        },
        {
          name: 'vis-network',
          var: 'vis',
          path: `peer/umd/vis-network.min.js`,
        },
      ]
    }),
  ]
})
