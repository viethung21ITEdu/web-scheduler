// Nạp biến môi trường từ file .env
require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  
  // Database configuration
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Nguyen21viet8hung5@$',
    database: process.env.DB_NAME || 'web_scheduler',
    port: process.env.DB_PORT || 3306
  },
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175'
  ]
}; 