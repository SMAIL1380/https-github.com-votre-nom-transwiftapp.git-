import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Delivery, DeliveryDocument } from './schemas/delivery.schema';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(Delivery.name) private deliveryModel: Model<DeliveryDocument>,
  ) {}

  async create(userId: string, createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    const delivery = new this.deliveryModel({
      ...createDeliveryDto,
      userId,
      status: 'pending',
      createdAt: new Date(),
    });
    return delivery.save();
  }

  async findAll(query: any = {}): Promise<Delivery[]> {
    return this.deliveryModel.find(query).exec();
  }

  async findOne(id: string): Promise<Delivery> {
    const delivery = await this.deliveryModel.findById(id).exec();
    if (!delivery) {
      throw new NotFoundException(`Livraison avec l'ID ${id} non trouvée`);
    }
    return delivery;
  }

  async findByUser(userId: string): Promise<Delivery[]> {
    return this.deliveryModel.find({ userId }).exec();
  }

  async findByDriver(driverId: string): Promise<Delivery[]> {
    return this.deliveryModel.find({ driverId }).exec();
  }

  async update(id: string, updateDeliveryDto: UpdateDeliveryDto): Promise<Delivery> {
    const delivery = await this.deliveryModel
      .findByIdAndUpdate(id, updateDeliveryDto, { new: true })
      .exec();
    
    if (!delivery) {
      throw new NotFoundException(`Livraison avec l'ID ${id} non trouvée`);
    }
    return delivery;
  }

  async updateStatus(id: string, status: string): Promise<Delivery> {
    const delivery = await this.deliveryModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    
    if (!delivery) {
      throw new NotFoundException(`Livraison avec l'ID ${id} non trouvée`);
    }
    return delivery;
  }

  async updateLocation(id: string, coordinates: number[]): Promise<Delivery> {
    const delivery = await this.deliveryModel
      .findByIdAndUpdate(
        id,
        {
          location: {
            type: 'Point',
            coordinates,
          },
        },
        { new: true },
      )
      .exec();
    
    if (!delivery) {
      throw new NotFoundException(`Livraison avec l'ID ${id} non trouvée`);
    }
    return delivery;
  }

  async addPhoto(id: string, photoUrl: string): Promise<Delivery> {
    const delivery = await this.deliveryModel
      .findByIdAndUpdate(
        id,
        { $push: { packagePhotos: photoUrl } },
        { new: true },
      )
      .exec();
    
    if (!delivery) {
      throw new NotFoundException(`Livraison avec l'ID ${id} non trouvée`);
    }
    return delivery;
  }

  async addSignature(id: string, signatureUrl: string): Promise<Delivery> {
    const delivery = await this.deliveryModel
      .findByIdAndUpdate(
        id,
        { signature: signatureUrl },
        { new: true },
      )
      .exec();
    
    if (!delivery) {
      throw new NotFoundException(`Livraison avec l'ID ${id} non trouvée`);
    }
    return delivery;
  }

  async remove(id: string): Promise<void> {
    const result = await this.deliveryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Livraison avec l'ID ${id} non trouvée`);
    }
  }
}
