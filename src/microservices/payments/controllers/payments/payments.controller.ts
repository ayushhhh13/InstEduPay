import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    Res,
  } from '@nestjs/common';
//   import { PaymentsService } from '../services/payments.service';
//   import { CreatePaymentDto } from '../dtos/create-payment.dto';
//   import { WebhookDto } from '../dtos/webhook.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { Response } from 'express';
import { PaymentsService } from '../../services/payments/payments.service';
import { CreatePaymentDto } from '../../dtos/create-payment.dto';
import { WebhookDto } from '../../dtos/webhook.dto';
import { get } from 'http';
  
  @Controller()
  export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}
  
    // Create payment and redirect to payment gateway
    @Post('create-payment')
    @UseGuards(AuthGuard('jwt'))
    async createPayment(@Body() createPaymentDto: CreatePaymentDto, @Res() res: Response) {
      const paymentData = await this.paymentsService.createPayment(createPaymentDto);
      return res.json(paymentData);
    }
  
    @Get('payment-status/:collect_request_id')
    @UseGuards(AuthGuard('jwt'))
    async getPaymentStatus(@Param('collect_request_id') collect_request_id: string, @Query('school_id') school_id: string) {
      const paymentStatus = await this.paymentsService.getPaymentStatus(collect_request_id,school_id);
      return paymentStatus;
    }
    // Webhook endpoint to receive payment status updates
    @Post('webhook')
    @HttpCode(200)
    async handleWebhook(@Body() webhookDto: WebhookDto) {
      return this.paymentsService.processWebhook(webhookDto);
    }
  
    // Fetch all transactions with pagination, sorting, and filtering
    @Get('transactions')
    @UseGuards(AuthGuard('jwt'))
    async getAllTransactions(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('sort') sort: string = 'payment_time',
      @Query('order') order: string = 'desc',
      @Query('status') status?: string,
    ) {
      return this.paymentsService.getAllTransactions(page, limit, sort, order, status);
    }
  
    // Fetch transactions for a specific school
    @Get('transactions/school/:schoolId')
    @UseGuards(AuthGuard('jwt'))
    async getSchoolTransactions(
      @Param('schoolId') schoolId: string,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('sort') sort: string = 'payment_time',
      @Query('order') order: string = 'desc',
    ) {
      return this.paymentsService.getSchoolTransactions(schoolId, page, limit, sort, order);
    }
    
    // Check transaction status by custom order ID
    @Get('transaction-status/:customOrderId')
    @UseGuards(AuthGuard('jwt'))
    async getTransactionStatus(@Param('customOrderId') customOrderId: string) {
      return this.paymentsService.getTransactionStatus(customOrderId);
    }
  }