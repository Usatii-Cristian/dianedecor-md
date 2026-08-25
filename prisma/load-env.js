/**
 * `node prisma/seed.js` runs outside Next.js, so .env.local is not loaded for
 * us. Imported first by the seed script, before the Prisma client is created.
 */
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file)
  } catch {
    // Both files are optional; the seed reports what is actually missing.
  }
}
