import User from '../../models/User';
import { GraphQLError } from 'graphql';
import { MyContext } from '../../types';
import { Role } from '../../models/Role';

const Query = {
  users: async (parent: any, args: any, context: MyContext) => {
    if (!context.user) {
      throw new GraphQLError('Unauthorized: You must be logged in to view users.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    if (context.user.role !== Role.SUPERADMIN) {
      throw new GraphQLError('Forbidden: You do not have permission to view all users.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    return User.find();
  },
  me: async (parent: any, args: any, context: MyContext) => {
    if (!context.user) {
      throw new GraphQLError('Unauthorized: You must be logged in to view your profile.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    const user = await User.findById(context.user.id);
    if (!user) {
      throw new GraphQLError('User not found.', {
        extensions: { code: 'NOT_FOUND' },
      });
    }
    return user;
  },
};

export default Query;