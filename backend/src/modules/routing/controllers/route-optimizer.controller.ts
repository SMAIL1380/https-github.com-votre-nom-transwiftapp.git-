import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RouteOptimizerService } from '../services/route-optimizer.service';
import { Location } from '../../common/interfaces/location.interface';

@Controller('api/routing')
@UseGuards(AuthGuard('jwt'))
export class RouteOptimizerController {
  constructor(private readonly routeOptimizerService: RouteOptimizerService) {}

  @Post('optimize')
  async optimizeRoute(
    @Body() params: {
      driverId: string;
      startLocation: Location;
      deliveries: Array<{
        id: string;
        pickupLocation: Location;
        deliveryLocation: Location;
        timeWindow?: {
          start: Date;
          end: Date;
        };
        priority?: number;
      }>;
      vehicleCapacity?: number;
      maxWorkingHours?: number;
    },
  ) {
    return this.routeOptimizerService.optimizeRoute(params);
  }

  @Post('reoptimize')
  async reoptimizeAllRoutes() {
    return this.routeOptimizerService.reoptimizeRoutes();
  }

  @Get('driver/:driverId/route')
  async getDriverOptimizedRoute(@Param('driverId') driverId: string) {
    // Implémenter la récupération de la route optimisée du chauffeur
  }

  @Post('driver/:driverId/route/update')
  async updateDriverRoute(
    @Param('driverId') driverId: string,
    @Body() params: {
      currentLocation: Location;
      skipDeliveryIds?: string[];
    },
  ) {
    // Implémenter la mise à jour de la route du chauffeur
  }
}
