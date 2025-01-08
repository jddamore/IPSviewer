/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SHOW_VIEWER_DEMO: boolean
    readonly DEV_SERVER_PORT: number
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}