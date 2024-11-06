declare global {
    namespace NodeJS {
      interface ProcessEnv {
        RESEND_API_KEY: string;
        NODE_ENV: 'development' | 'production';
      }
    }
  }
  
  export {};