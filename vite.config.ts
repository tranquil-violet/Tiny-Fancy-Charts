import { defineConfig } from 'vite';
import { resolve, relative, extname } from 'path';
import { globSync } from 'glob';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';

const isBuild = process.env.NODE_ENV === 'production';

const entryList = globSync('lib/charts/*/index.ts').map((file) => ['es/' + file.replace('\\', '/').split('/')[2], resolve(file)]);
entryList.push(['index', resolve('lib/charts/index.ts')]);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: isBuild ? [dts({ entryRoot: 'lib' })] : [vue()],
  build: {
    lib: {
      entry: Object.fromEntries(entryList),
    },
    rollupOptions: {},
  },
});
