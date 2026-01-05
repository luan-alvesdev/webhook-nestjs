import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  UseGuards, 
  Logger,
  Delete
} from '@nestjs/common';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { WebhookService } from './webhook.service';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Main webhook endpoint
   */
  @Post()
  @UseGuards(WebhookSignatureGuard)
  async receive(@Body() event: WebhookEventDto) {
    this.logger.log(`Received webhook: ${event.type}`);
    return await this.webhookService.handle(event);
  }

  /**
   * Test endpoints (remove in production)
   */
  @Get('test/orders')
  async getOrders() {
    return {
      success: true,
      data: this.webhookService.getAllOrders ? this.webhookService.getAllOrders() : []
    };
  }

  @Get('test/orders/:id')
  async getOrder(@Param('id') id: string) {
    if (!this.webhookService.getOrder) {
      return {
        success: false,
        message: 'Method not implemented'
      };
    }
    
    const order = this.webhookService.getOrder(id);
    if (!order) {
      return {
        success: false,
        message: 'Order not found'
      };
    }
    return {
      success: true,
      data: order
    };
  }

  @Post('test/order-created')
  async testOrderCreated() {
    const event = {
      id: `evt_${Date.now()}`,
      type: 'order.created',
      createdAt: new Date().toISOString(),
      payload: {
        id: `order_${Math.floor(Math.random() * 10000)}`,
        customerName: 'Test Customer',
        items: [
          { id: 'item1', name: 'Product 1', quantity: 2, price: 29.90 },
          { id: 'item2', name: 'Product 2', quantity: 1, price: 59.90 }
        ],
        total: 119.70
      }
    };

    this.logger.log(`Simulating event: ${event.type}`);
    return this.webhookService.handle(event);
  }

  @Post('test/order-updated')
  async testOrderUpdated() {
    if (!this.webhookService.getAllOrders) {
      return {
        success: false,
        message: 'Method not implemented'
      };
    }

    const orders = this.webhookService.getAllOrders();
    if (orders.length === 0) {
      return {
        success: false,
        message: 'No orders found to update'
      };
    }

    const order = orders[0];
    const event = {
      id: `evt_${Date.now()}`,
      type: 'order.updated',
      createdAt: new Date().toISOString(),
      payload: {
        id: order.id,
        status: 'processing',
        updatedAt: new Date().toISOString()
      }
    };

    this.logger.log(`Simulating event: ${event.type}`);
    return this.webhookService.handle(event);
  }

  @Post('test/order-cancelled')
  async testOrderCancelled() {
    if (!this.webhookService.getAllOrders) {
      return {
        success: false,
        message: 'Method not implemented'
      };
    }

    const orders = this.webhookService.getAllOrders();
    if (orders.length === 0) {
      return {
        success: false,
        message: 'No orders found to cancel'
      };
    }

    const order = orders[0];
    const event = {
      id: `evt_${Date.now()}`,
      type: 'order.cancelled',
      createdAt: new Date().toISOString(),
      payload: {
        id: order.id,
        reason: 'Cancelled by test'
      }
    };

    this.logger.log(`Simulating event: ${event.type}`);
    return this.webhookService.handle(event);
  }
}