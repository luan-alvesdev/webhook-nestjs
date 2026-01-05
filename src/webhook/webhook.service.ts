import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private processedEvents = new Set<string>();
  private orders = new Map<string, any>(); // Add this line to store orders

  async handle(event: WebhookEventDto) {
    if (this.processedEvents.has(event.id)) {
      this.logger.warn(`Duplicate event ${event.id} ignored`);
      return;
    }

    this.processedEvents.add(event.id);

    switch (event.type) {
      case 'order.created':
        return this.handleOrderCreated(event.payload);
      case 'order.updated':
        return this.handleOrderUpdated(event.payload);
      case 'order.cancelled':
        return this.handleOrderCancelled(event.payload);
      default:
        this.logger.warn(`Unhandled event type: ${event.type}`);
    }
  }

  private handleOrderCreated(payload: any) {
    this.logger.log(`Processing order ${payload.id}`);
    this.orders.set(payload.id, { 
      ...payload, 
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true, orderId: payload.id };
  }

  private handleOrderUpdated(payload: any) {
    if (!this.orders.has(payload.id)) {
      this.logger.warn(`Order ${payload.id} not found for update`);
      return { success: false, message: 'Order not found' };
    }

    const existingOrder = this.orders.get(payload.id);
    const updatedOrder = {
      ...existingOrder,
      ...payload,
      updatedAt: new Date().toISOString()
    };
    
    this.orders.set(payload.id, updatedOrder);
    this.logger.log(`Order ${payload.id} updated`);
    return { success: true, order: updatedOrder };
  }

  private handleOrderCancelled(payload: any) {
    if (!this.orders.has(payload.id)) {
      this.logger.warn(`Order ${payload.id} not found for cancellation`);
      return { success: false, message: 'Order not found' };
    }

    const existingOrder = this.orders.get(payload.id);
    const cancelledOrder = {
      ...existingOrder,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: payload.reason || 'No reason provided',
      updatedAt: new Date().toISOString()
    };
    
    this.orders.set(payload.id, cancelledOrder);
    this.logger.log(`Order ${payload.id} cancelled`);
    return { success: true, order: cancelledOrder };
  }

  // Add these methods at the end of the class, before the closing brace
  getAllOrders() {
    return Array.from(this.orders.values());
  }

  getOrder(id: string) {
    return this.orders.get(id);
  }
}