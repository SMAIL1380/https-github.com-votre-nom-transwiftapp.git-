import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  return {
    uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/transwift_new',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
};
