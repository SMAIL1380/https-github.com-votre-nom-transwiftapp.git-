import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Badge,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import 'moment/locale/fr';
import { CarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAPI } from '../../hooks/useAPI';

moment.locale('fr');

interface VehicleAvailability {
  date: string;
  availableVehicles: number;
  totalVehicles: number;
  events: Array<{
    vehicleId: string;
    registrationNumber: string;
    type: 'delivery' | 'maintenance';
    start: string;
    end: string;
    details: any;
  }>;
}

const VehicleAvailabilityCalendar: React.FC = () => {
  const { api } = useAPI();
  const [availabilityData, setAvailabilityData] = useState<Record<string, VehicleAvailability>>({});
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailabilityData();
  }, [selectedDate]);

  const loadAvailabilityData = async () => {
    try {
      setLoading(true);
      const startDate = moment(selectedDate).startOf('month');
      const endDate = moment(selectedDate).endOf('month');

      const response = await api.get('/vehicles/availability', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      const formattedData = {};
      response.data.forEach((item: VehicleAvailability) => {
        formattedData[item.date] = item;
      });

      setAvailabilityData(formattedData);
    } catch (error) {
      console.error('Error loading availability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityStatus = (date: Moment) => {
    const dateStr = date.format('YYYY-MM-DD');
    const data = availabilityData[dateStr];

    if (!data) return null;

    const availabilityRate = (data.availableVehicles / data.totalVehicles) * 100;
    
    if (availabilityRate >= 70) {
      return 'success';
    } else if (availabilityRate >= 30) {
      return 'warning';
    }
    return 'error';
  };

  const dateCellRender = (date: Moment) => {
    const dateStr = date.format('YYYY-MM-DD');
    const data = availabilityData[dateStr];

    if (!data) return null;

    const status = getAvailabilityStatus(date);
    const events = data.events || [];

    return (
      <div>
        <Badge
          status={status}
          text={`${data.availableVehicles}/${data.totalVehicles} disponibles`}
        />
        <div style={{ marginTop: 4 }}>
          {events.slice(0, 2).map((event, index) => (
            <Tooltip
              key={index}
              title={
                event.type === 'delivery'
                  ? `Livraison - ${event.registrationNumber}`
                  : `Maintenance - ${event.registrationNumber}`
              }
            >
              <Badge
                status={event.type === 'delivery' ? 'processing' : 'warning'}
                style={{ marginRight: 4 }}
              />
            </Tooltip>
          ))}
          {events.length > 2 && (
            <Tooltip title={`${events.length - 2} autres événements`}>
              <Badge count={`+${events.length - 2}`} style={{ backgroundColor: '#999' }} />
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  const renderDayDetails = (date: Moment) => {
    const dateStr = date.format('YYYY-MM-DD');
    const data = availabilityData[dateStr];

    if (!data) return null;

    return (
      <Card title={date.format('dddd D MMMM YYYY')} size="small">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic
              title="Véhicules disponibles"
              value={data.availableVehicles}
              suffix={`/ ${data.totalVehicles}`}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Livraisons planifiées"
              value={data.events.filter(e => e.type === 'delivery').length}
              prefix={<CarOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Maintenances"
              value={data.events.filter(e => e.type === 'maintenance').length}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div>
      <Calendar
        dateCellRender={dateCellRender}
        onChange={setSelectedDate}
        value={selectedDate}
      />
      {selectedDate && renderDayDetails(selectedDate)}
    </div>
  );
};

export default VehicleAvailabilityCalendar;
