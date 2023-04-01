module.exports = {
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
  db_url: process.env.DB_URL,
  socket_url: process.env.SOCKET_URL,
  salt: process.env.SALT,
  secretKeys: process.env.JWT_SECRET_KEYS
};
