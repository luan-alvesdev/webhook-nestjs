import { IsString, IsObject } from 'class-validator';

export class WebhookEventDto {
  @IsString()
  id: string;

  @IsString()
  type: string; // ex: order.created

  @IsObject()
  payload: Record<string, any>;

  @IsString()
  createdAt: string;
}
