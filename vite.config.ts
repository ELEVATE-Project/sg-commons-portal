import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const rootPath = process.env.VITE_ROOT_PATH ? `/${process.env.VITE_ROOT_PATH}` : ''

export default defineConfig({
  base: rootPath,
  build: {
    outDir: "build",
  },
  server: {
    port: 3000
  },
  plugins: [react()],
  resolve: {
    alias: {
      'store': path.resolve(__dirname, 'src/store'),
      'hooks': path.resolve(__dirname, 'src/hooks'),
      'api': path.resolve(__dirname, 'src/api'),
      'configure': path.resolve(__dirname, 'src/configure'),
      'utils': path.resolve(__dirname, 'src/utils'),
      'constants': path.resolve(__dirname, 'src/constants'),
      'services': path.resolve(__dirname, 'src/services'),
      'components': path.resolve(__dirname, 'src/components'),
      'pages': path.resolve(__dirname, 'src/pages'),
      'assets': path.resolve(__dirname, 'src/assets'),
    },
  },
})