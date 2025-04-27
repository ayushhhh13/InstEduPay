import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../../models/order.model';
import { OrderStatus } from '../../models/order-status.model';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { UpdateOrderDto } from '../../dtos/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatus>,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = new this.orderModel(createOrderDto);
    const savedOrder = await newOrder.save();
    
    // Create initial order status
    const orderStatus = new this.orderStatusModel({
      collect_id: savedOrder._id,
      order_amount: createOrderDto.amount || 0,
      status: 'pending',
    });
    await orderStatus.save();
    
    return savedOrder;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return order;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    // Remove associated order status
    await this.orderStatusModel.deleteOne({ collect_id: new Types.ObjectId(id) }).exec();
  }

  async findAllWithStatus(page = 1, limit = 10, sort = 'payment_time', order = 'desc') {
    const skip = (page - 1) * limit;
    
    const sortOption = {};
    sortOption[sort] = order === 'desc' ? -1 : 1;
    
    return this.orderModel.aggregate([
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
        },
      },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limit },
    ]);
  }

  async findBySchoolId(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return this.orderModel.aggregate([
      { $match: { school_id: new Types.ObjectId(schoolId) } },
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
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);
  }

  async findByCustomOrderId(customOrderId: string) {
    const order = await this.orderModel.findOne({ custom_order_id: customOrderId }).exec();
    
    if (!order) {
      throw new NotFoundException(`Order with custom ID ${customOrderId} not found`);
    }
    
    const orderStatus = await this.orderStatusModel
      .findOne({ collect_id: order._id })
      .exec();
    
    return {
      order,
      status: orderStatus,
    };
  }

  async getOrderStatus(collectId: string) {
    const orderStatus = await this.orderStatusModel
      .findOne({ collect_id: new Types.ObjectId(collectId) })
      .exec();
    
    if (!orderStatus) {
      throw new NotFoundException(`Order status for collect ID ${collectId} not found`);
    }
    
    return orderStatus;
  }

  async updateOrderStatus(collectId: string, statusData: any) {
    const orderStatus = await this.orderStatusModel
      .findOneAndUpdate(
        { collect_id: new Types.ObjectId(collectId) },
        statusData,
        { new: true },
      )
      .exec();
    
    if (!orderStatus) {
      throw new NotFoundException(`Order status for collect ID ${collectId} not found`);
    }
    
    return orderStatus;
  }
}