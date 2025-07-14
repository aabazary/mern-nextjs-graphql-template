import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt'; 
import passport from 'passport';
import User from '../models/User'; 

interface JwtPayload {
  userId: string;
  role: string;
  iat: number; 
  exp: number; 
}

const configurePassport = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined for Passport.js JWT Strategy.');
  }

  const opts: StrategyOptionsWithoutRequest = { 
    jwtFromRequest: (req) => {
      // Try to get token from Authorization header first (for backward compatibility)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
      
      // Then try to get from cookies
      return req.cookies?.accessToken || null;
    },
    secretOrKey: process.env.JWT_SECRET, 
  
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload: JwtPayload, done) => {
      try {
        const user = await User.findById(jwt_payload.userId);

        if (user) {
          return done(null, user); 
        } else {
          return done(null, false, { message: 'User not found' }); 
        }
      } catch (error) {
        if (error instanceof Error) {
          return done(error, false, { message: `Internal server error: ${error.message}` });
        }
        return done(new Error('Internal server error'), false, { message: 'Unknown internal server error' });
      }
    })
  );
};

export default configurePassport;