/// <reference types="vite/client" />

// Allow CSS module imports
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Allow GLB asset imports
declare module '*.glb' {
  const src: string
  export default src
}
