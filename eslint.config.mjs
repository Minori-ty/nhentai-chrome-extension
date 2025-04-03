import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nhentai from './src/plugins/index.mjs'

export default defineConfig([
    { ignores: ['dist_chrome', 'custom-vite-plugins.ts', 'global.d.ts', 'tailwind.config.cjs'] },
    { files: ['src/**/*.{js,mjs,cjs,ts}'] },
    { files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: globals.browser } },
    { files: ['**/*.{js,mjs,cjs,ts}'], plugins: { js }, extends: ['js/recommended'] },
    tseslint.configs.recommended,
    nhentai.configs.recommended,
])
