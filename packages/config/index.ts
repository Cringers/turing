const { NODE_ENV } = process.env;
export const CONFIG = Object.freeze({
   BACKEND_PORT: 4000,
   CURRENT_CROSSWORD: 'josh',
   FRONTEND_PORT: NODE_ENV === 'development' ? 3000 : 443,
   SSL_CERT: NODE_ENV === 'production' ? '/home/opc/certificate.crt' : '',
   SSL_KEY: NODE_ENV === 'production' ? '/home/opc/private.key' : '',
   STAGE: NODE_ENV,
   BLANK_CHARACTER: '.',
});
