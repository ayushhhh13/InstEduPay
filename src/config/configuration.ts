export default () => ({
    port: parseInt(process.env.PORT || '3333', 10),
    jwtSecret: process.env.JWT_SECRET || 'secretKey',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/my_database',
    },
    paymentGateway: {
      pgKey: process.env.PG_KEY || 'edvtest01',
      apiKey: process.env.API_KEY || 'YOUR_API_KEY',
      schoolId: process.env.SCHOOL_ID || '65b0e6293e9f76a9694d84b4',
      apiUrl: process.env.API_URL || 'https://dev-vanilla.edviron.com/erp',
    },
  });