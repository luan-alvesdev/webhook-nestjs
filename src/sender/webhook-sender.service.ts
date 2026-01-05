import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSenderService {
  async send(event: any) {
    const secret = process.env.WEBHOOK_SECRET!;
    const body = JSON.stringify(event);

    const signature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    await axios.post('http://localhost:3001/webhooks', event, {
      headers: {
        'x-webhook-signature': signature,
        'Content-Type': 'application/json',
      },
    });
  }
}
