// Nạp biến môi trường từ file .env
require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT,
  
  // Database configuration
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  },
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175'
  ]
}; 