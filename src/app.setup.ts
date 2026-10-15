import { INestApplication, ValidationPipe } from '@nestjs/common';

/** Shared app configuration, used by main.ts and by the e2e tests. */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      transform: true, // convert payloads to DTO instances
    }),
  );
}
