import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeliveryService } from './delivery.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DeliveryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly deliveryService: DeliveryService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinDeliveryRoom')
  async handleJoinRoom(client: Socket, deliveryId: string) {
    client.join(`delivery_${deliveryId}`);
    const delivery = await this.deliveryService.findOne(deliveryId);
    this.server.to(`delivery_${deliveryId}`).emit('deliveryUpdate', delivery);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('leaveDeliveryRoom')
  handleLeaveRoom(client: Socket, deliveryId: string) {
    client.leave(`delivery_${deliveryId}`);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(client: Socket, data: { deliveryId: string; coordinates: number[] }) {
    const delivery = await this.deliveryService.updateLocation(
      data.deliveryId,
      data.coordinates,
    );
    this.server.to(`delivery_${data.deliveryId}`).emit('locationUpdate', {
      deliveryId: data.deliveryId,
      location: delivery.location,
    });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('updateStatus')
  async handleStatusUpdate(client: Socket, data: { deliveryId: string; status: string }) {
    const delivery = await this.deliveryService.updateStatus(
      data.deliveryId,
      data.status,
    );
    this.server.to(`delivery_${data.deliveryId}`).emit('statusUpdate', {
      deliveryId: data.deliveryId,
      status: delivery.status,
    });
  }

  // Méthode pour diffuser les mises à jour à tous les clients dans une salle
  public broadcastDeliveryUpdate(deliveryId: string, update: any) {
    this.server.to(`delivery_${deliveryId}`).emit('deliveryUpdate', update);
  }
}
