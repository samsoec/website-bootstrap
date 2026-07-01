/**
 * Clears Strapi's cached component/content-type/model metadata from the
 * `strapi::core-store` table and forces a schema resync from `./dist`.
 *
 * Useful when a schema change made via the admin panel or by hand-editing
 * JSON doesn't seem to take effect after a rebuild/redeploy — Strapi caches
 * schema metadata in the database and a stale cache can mask the new fields.
 *
 * Usage: node nuke-cache.js
 */

const strapi = require('@strapi/strapi');

async function nukeCacheAndReload() {
  console.log('Loading Strapi...');
  const app = await strapi.createStrapi({ distDir: './dist' }).load();

  try {
    console.log('\n=== Step 1: Clear cached schema metadata ===');

    const componentMeta = await app.db.query('strapi::core-store').deleteMany({
      where: {
        key: { $contains: 'component' },
      },
    });
    console.log('✓ Cleared component metadata:', componentMeta);

    const ctMeta = await app.db.query('strapi::core-store').deleteMany({
      where: {
        key: { $startsWith: 'plugin_content_manager_configuration' },
      },
    });
    console.log('✓ Cleared content manager metadata:', ctMeta);

    const modelMeta = await app.db.query('strapi::core-store').deleteMany({
      where: {
        key: { $startsWith: 'model_' },
      },
    });
    console.log('✓ Cleared model metadata:', modelMeta);

    console.log('\n=== Step 2: Force schema.sync() ===');
    await app.db.schema.sync();
    console.log('✓ Schema synced from dist');

    await app.destroy();

    console.log('\n✓✓✓ Done. Now:');
    console.log('1. Restart your Strapi app from the hosting panel');
    console.log('2. Clear your local cache: rm -rf .cache .strapi');
    console.log('3. Verify the schema change via the API/admin panel');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    await app.destroy();
    process.exit(1);
  }
}

nukeCacheAndReload().catch(console.error);
