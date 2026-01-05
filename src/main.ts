import { NestFactory } from '@nestjs/core';
import { WebhookModule } from './webhook/webhook.module';

async function bootstrap() {
  const app = await NestFactory.create(WebhookModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
