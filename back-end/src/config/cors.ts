import { CorsOptions } from 'cors'; 

const allowedOrigin = process.env.FRONTEND_URL;

if (!allowedOrigin) {
  console.warn('FRONTEND_URL is not defined in environment variables. CORS will be wide open or behave unexpectedly in production.');
}

const corsOptions: CorsOptions = {
  origin: allowedOrigin || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'], 
};

export default corsOptions;