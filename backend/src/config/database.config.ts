import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/transwift',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  postgres: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'your_password',
    database: process.env.POSTGRES_DB || 'transwift',
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
  },
}));
