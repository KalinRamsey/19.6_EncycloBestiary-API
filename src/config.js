module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dunder_mifflin@localhost/encyclo-bestiary',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/encyclo-bestiary-test',
  JWT_SECRET: process.env.JWT_SECRET || 'the-tell-tale-heart',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '30d'
}