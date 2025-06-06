import { resolve } from 'path'
import { ManifestV3Export } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, BuildOptions } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { stripDevIcons } from './custom-vite-plugins'
import manifest from './manifest.json'
import devManifest from './manifest.dev.json'
import pkg from './package.json'

const isDev = process.env.__DEV__ === 'true'
// set this flag to true, if you want localization support
const localize = false

export const baseManifest = {
    ...manifest,
    version: pkg.version,
    ...(isDev ? devManifest : ({} as ManifestV3Export)),
    ...(localize
        ? {
              name: '__MSG_extName__',
              description: '__MSG_extDescription__',
              default_locale: 'en',
          }
        : {}),
} as ManifestV3Export

export const baseBuildOptions: BuildOptions = {
    sourcemap: isDev,
    emptyOutDir: !isDev,
}

export default defineConfig({
    plugins: [tailwindcss(), tsconfigPaths(), stripDevIcons(isDev)],
    publicDir: resolve(__dirname, 'public'),
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    worker: {
        format: 'es',
    },
})
