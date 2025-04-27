import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Order } from 'src/microservices/orders/models/order.model';
import { OrderStatus } from 'src/microservices/orders/models/order-status.model';
import { WebhookLog } from '../../models/webhook-log.model';
import { OrdersService } from 'src/microservices/orders/services/orders/orders.service';
import { CreatePaymentDto } from '../../dtos/create-payment.dto';
import { WebhookDto } from '../../dtos/webhook.dto';
// import { Order } from '../../orders/models/order.model';
// import { OrderStatus } from '../../orders/models/order-status.model';
// import { WebhookLog } from '../models/webhook-log.model';
// import { CreatePaymentDto } from '../dtos/create-payment.dto';
// import { WebhookDto } from '../dtos/webhook.dto';
// import { OrdersService } from '../../orders/services/orders.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatus>,
    @InjectModel(WebhookLog.name) private webhookLogModel: Model<WebhookLog>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {}

  // Create a payment request and redirect to payment gateway
  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      // Extract data from the request
      const { amount, callback_url, student_info } = createPaymentDto;
      const school_id = this.configService.get<string>('paymentGateway.schoolId');

      // Create order in the database
      const order = await this.ordersService.create({
        school_id,
        trustee_id: createPaymentDto.trustee_id || school_id, // Default to school_id if not provided
        student_info,
        gateway_name: 'PhonePe', // Default gateway name
        amount: parseFloat(amount),
      });

      // Generate JWT signature for the payment gateway request
      const payload = {
        school_id,
        amount,
        callback_url,
      };
      
      const sign = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('paymentGateway.pgKey'),
      });

      // Call the payment gateway API
      const apiUrl = `${this.configService.get<string>('paymentGateway.apiUrl')}/create-collect-request`;
      const apiKey = this.configService.get<string>('paymentGateway.apiKey');
      
      const response = await axios.post(
        apiUrl,
        {
          school_id,
          amount,
          callback_url,
          sign,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        },
      );

      // Update the order with the collect_request_id
      if (response.data && response.data.collect_request_id) {
        await this.orderModel.findByIdAndUpdate(
          order._id,
          { custom_order_id: response.data.collect_request_id },
        );

        // Update the order status with the collect_id
        await this.orderStatusModel.findOneAndUpdate(
          { collect_id: order._id },
          { collect_id: order._id },
        );
      }
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error.response?.data || error.message);
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to create payment',
      );
    }
  }

  async getPaymentStatus(collect_request_id: string, school_id: string) {
    try {
      const Payload = {
        school_id,
        collect_request_id,
      }
      const newSign = this.jwtService.sign(Payload, {
        secret: this.configService.get<string>('paymentGateway.pgKey'),
      });
      //get current payment status
      const PaymentStatus = await axios.get(`${this.configService.get<string>('paymentGateway.apiUrl')}/collect-request/${collect_request_id}`,{
          headers: {
            'Authorization': `Bearer ${this.configService.get<string>('paymentGateway.apiKey')}`,
          },
          params:{
            school_id,
            sign: newSign,
          }
        });
      return PaymentStatus.data;
    } catch (error) {
      console.error('Error checking payment status:', error.response?.data || error.message);
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to check payment status',
      );
    }
  }
  // Process webhook from payment gateway
  async processWebhook(webhookDto: WebhookDto) {
    try {
      // Log the webhook
      const webhookLog = new this.webhookLogModel({
        collect_id: webhookDto.order_info.order_id,
        payload: webhookDto,
      });
      
      // Extract order_id from webhook payload
      const { order_id } = webhookDto.order_info;
      
      // Find the order by custom_order_id
      const order = await this.orderModel.findOne({ custom_order_id: order_id });
      
      if (!order) {
        webhookLog.error = `Order not found for order_id: ${order_id}`;
        webhookLog.processed = false;
        await webhookLog.save();
        return { status: 'error', message: 'Order not found' };
      }
      
      // Update order status
      const statusUpdate = {
        order_amount: webhookDto.order_info.order_amount,
        transaction_amount: webhookDto.order_info.transaction_amount,
        payment_mode: webhookDto.order_info.payment_mode,
        payment_details: webhookDto.order_info.payemnt_details, // Note: There's a typo in the field name
        bank_reference: webhookDto.order_info.bank_reference,
        payment_message: webhookDto.order_info.Payment_message, // Note: Inconsistent capitalization
        status: webhookDto.order_info.status.toLowerCase(),
        error_message: webhookDto.order_info.error_message,
        payment_time: webhookDto.order_info.payment_time,
      };
      
      
      await this.orderStatusModel.findOneAndUpdate(
        { collect_id: order._id },
        statusUpdate,
        { new: true },
      );
      
      // Mark webhook as processed
      webhookLog.processed = true;
      webhookLog.response = 'Success';
      await webhookLog.save();
      
      return { status: 'success', message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Log webhook processing error
      const errorLog = new this.webhookLogModel({
        collect_id: webhookDto.order_info?.order_id || 'unknown',
        payload: webhookDto,
        error: error.message,
        processed: false,
      });
      await errorLog.save();
      
      return { status: 'error', message: error.message };
    }
  }

  // Get all transactions with pagination, sorting, and filtering
  async getAllTransactions(
    page: number = 1,
    limit: number = 10,
    sort: string = 'payment_time',
    order: string = 'desc',
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    
    // Prepare match stage for filtering
    const match: any = {};
    if (status) {
      match['status.status'] = status;
    }
    
    // Prepare sort stage
    const sortOption: any = {};
    sortOption[sort] = order === 'desc' ? -1 : 1;
    
    // Use aggregation pipeline to join order and order_status collections
    const transactions = await this.orderModel.aggregate([
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status',
        },
      },
      { $unwind: '$status' },
      ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status.order_amount',
          transaction_amount: '$status.transaction_amount',
          status: '$status.status',
          custom_order_id: 1,
          payment_time: '$status.payment_time',
        },
      },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limit },
    ]);
    
    // Get total count for pagination
    const total = await this.orderModel.countDocuments();
    
    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get transactions for a specific school
  async getSchoolTransactions(
    schoolId: string,
    page: number = 1,
    limit: number = 10,
    sort: string = 'payment_time',
    order: string = 'desc',
  ) {
    const skip = (page - 1) * limit;
    
    // Prepare sort stage
    const sortOption: any = {};
    sortOption[sort] = order === 'desc' ? -1 : 1;
    
    // Use aggregation pipeline to join order and order_status collections
    const transactions = await this.orderModel.aggregate([
      { $match: { school_id: schoolId } },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status',
        },
      },
      { $unwind: '$status' },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status.order_amount',
          transaction_amount: '$status.transaction_amount',
          status: '$status.status',
          custom_order_id: 1,
          payment_time: '$status.payment_time',
        },
      },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limit },
    ]);
    
    // Get total count for pagination
    const total = await this.orderModel.countDocuments({ school_id: schoolId });
    
    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get transaction status by custom order ID
  async getTransactionStatus(customOrderId: string) {
    const order = await this.orderModel.findOne({ custom_order_id: customOrderId });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${customOrderId} not found`);
    }
    
    const orderStatus = await this.orderStatusModel.findOne({ collect_id: order._id });
    
    if (!orderStatus) {
      throw new NotFoundException(`Order status for order ${customOrderId} not found`);
    }
    
    return {
      order_id: customOrderId,
      status: orderStatus.status,
      payment_mode: orderStatus.payment_mode,
      transaction_amount: orderStatus.transaction_amount,
      order_amount: orderStatus.order_amount,
      payment_time: orderStatus.payment_time,
      error_message: orderStatus.error_message,
    };
  }

  // Check payment status with payment gateway
  async checkPaymentStatus(collectRequestId: string) {
    try {
      const school_id = this.configService.get<string>('paymentGateway.schoolId');
      
      // Generate JWT signature for the status check
      const payload = {
        school_id,
        collect_request_id: collectRequestId,
      };
      
      const sign = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('paymentGateway.pgKey'),
      });
      
      // Call the payment gateway API for status check
      const apiUrl = `${this.configService.get<string>('paymentGateway.apiUrl')}/collect-request/${collectRequestId}`;
      const apiKey = this.configService.get<string>('paymentGateway.apiKey');
      
      const response = await axios.get(
        `${apiUrl}?school_id=${school_id}&sign=${sign}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        },
      );
      
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error.response?.data || error.message);
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to check payment status',
      );
    }
  }
}