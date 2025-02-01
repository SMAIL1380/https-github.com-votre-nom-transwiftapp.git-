import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';

@Entity('location_history')
export class LocationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column({ type: 'float', nullable: true })
  speed: number;

  @Column({ type: 'float', nullable: true })
  heading: number;

  @Column({ type: 'float', nullable: true })
  accuracy: number;

  @Column({ type: 'float', nullable: true })
  altitude: number;

  @ManyToOne(() => Driver, driver => driver.locationHistory)
  driver: Driver;

  @CreateDateColumn()
  timestamp: Date;
}
