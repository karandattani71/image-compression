export const config = (): any => ({
  port: process.env.PORT,
  contextPath: 'api/v1',
  enableMetaData: true,
  database: {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: ['./modules/**/*.entity.ts'],
    autoLoadEntities: true,
    keepConnectionAlive: true,
  },
  swagger: {
    isEnabled: true,
    uiPath: '/swagger-ui',
    authUsers: {
      root: 'toor',
      admin: 'admin@123',
    },
  },
});
