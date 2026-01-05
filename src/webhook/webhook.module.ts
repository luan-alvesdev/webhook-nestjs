import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookSenderService } from '../sender/webhook-sender.service';

@Module({
  imports: [],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookSenderService],
  exports: [WebhookService, WebhookSenderService],
})
export class WebhookModule {}