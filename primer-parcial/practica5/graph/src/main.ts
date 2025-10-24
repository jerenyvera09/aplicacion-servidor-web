import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilitamos CORS para uso con Apollo Studio Sandbox y frontends locales
  app.enableCors({
    origin: [
      'http://localhost:3000', // REST / posibles frontends locales
      'http://localhost:4200', // Angular dev
      'http://localhost:5173', // Vite dev
      'https://studio.apollographql.com', // Apollo Studio Sandbox
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'content-type',
      'apollographql-client-name',
      'apollographql-client-version',
    ],
  });
  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  // Log amigable para saber dónde está escuchando
  console.log(`Graph API escuchando en: http://${displayHost}:${port}`);
  console.log(`GraphQL endpoint: http://${displayHost}:${port}/graphql`);
}
bootstrap().catch((err) => {
  console.error('Error al iniciar la aplicación:', err);
  process.exit(1);
});
