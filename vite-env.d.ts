// Fix: Removed reference to 'vite/client' to avoid "Cannot find type definition file" error

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    [key: string]: string | undefined;
  }
}