export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  transfer: {
    remote: {
      enabled: true,
    },
  },
  watchIgnoreFiles: [
    '**/data/**',
    '**/public/uploads/**',
    '**/.tmp/**',
    '**/node_modules/**',
    '**/.git/**',
    '**/logs/**',
    '**/coverage/**',
  ],
});
