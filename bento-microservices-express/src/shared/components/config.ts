import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV}`
});

const port = process.env.PORT || '3000';
const host = process.env.HOST || '0.0.0.0';

const jwtSecret = process.env.JWT_SECRET_KEY;
if (!jwtSecret) {
  throw new Error('FATAL: JWT_SECRET_KEY environment variable is required');
}

const defaultServiceUrl = `http://localhost:${port}/v1`;

export const config = {
  envName: process.env.NODE_ENV,
  port,
  host,
  jwtSecret,
  rpc: {
    jwtSecret,
    introspectUrl: process.env.VERIFY_TOKEN_URL || `http://localhost:${port}/v1/rpc/introspect`,
    postServiceURL: process.env.POST_SERVICE_URL || defaultServiceUrl,
    userServiceURL: process.env.USER_SERVICE_URL || defaultServiceUrl,
    commentServiceURL: process.env.COMMENT_SERVICE_URL || defaultServiceUrl,
    followServiceURL: process.env.FOLLOW_SERVICE_URL || defaultServiceUrl,
    topicServiceURL: process.env.TOPIC_SERVICE_URL || defaultServiceUrl,
    postLikeServiceURL: process.env.POST_LIKE_SERVICE_URL || defaultServiceUrl,
    postSavedServiceURL: process.env.POST_SAVED_SERVICE_URL || defaultServiceUrl
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    url: process.env.REDIS_URL
  },
  db: {
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  },
  upload: {
    type: 'local',
    path: 'uploads',
    cdn: process.env.CDN_URL || `http://localhost:${port}/uploads`
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    baseFolder: process.env.CLOUDINARY_FOLDER || 'social-network-500bros'
  },
  dbURL: process.env.DATABASE_URL || ''
};
