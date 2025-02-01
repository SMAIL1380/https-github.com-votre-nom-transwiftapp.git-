import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Card,
  Row,
  Col,
  Select,
  Button,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Input,
  Tag,
  Table,
  Tooltip,
  message,
} from 'antd';
import {
  CarOutlined,
  ScheduleOutlined,
  ToolOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { Moment } from 'moment';
import moment from 'moment';
import 'moment/locale/fr';
import { useAPI } from '../../hooks/useAPI';
import { Vehicle } from '../../types/vehicle';
import VehicleTimeline from './VehicleTimeline';

moment.locale('fr');

const { RangePicker } = DatePicker;
const { Option } = Select;

const VehiclePlanningScreen: React.FC = () => {
  const { api } = useAPI();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [availabilityView, setAvailabilityView] = useState<'calendar' | 'timeline'>('calendar');

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      loadVehicleSchedule();
    }
  }, [selectedVehicle, selectedDate]);

  const loadVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      message.error('Erreur lors du chargement des véhicules');
    }
  };

  const loadVehicleSchedule = async () => {
    if (!selectedVehicle) return;

    try {
      setLoading(true);
      const startDate = moment(selectedDate).startOf('month');
      const endDate = moment(selectedDate).endOf('month');

      const response = await api.get(`/vehicles/${selectedVehicle}/schedule`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      setEvents(response.data);
    } catch (error) {
      console.error('Error loading schedule:', error);
      message.error('Erreur lors du chargement du planning');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (values: any) => {
    try {
      const { type, startDate, endDate, ...rest } = values;
      
      if (type === 'maintenance') {
        await api.post(`/vehicles/${selectedVehicle}/maintenance`, {
          date: startDate.toISOString(),
          ...rest,
        });
      } else {
        await api.post(`/vehicles/${selectedVehicle}/assignments`, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          ...rest,
        });
      }

      message.success('Événement ajouté avec succès');
      setModalVisible(false);
      loadVehicleSchedule();
    } catch (error) {
      console.error('Error adding event:', error);
      message.error('Erreur lors de l\'ajout de l\'événement');
    }
  };

  const dateCellRender = (date: Moment) => {
    const dayEvents = events.filter(event => {
      const eventDate = moment(event.start);
      return eventDate.isSame(date, 'day');
    });

    return (
      <ul className="events">
        {dayEvents.map((event, index) => (
          <li key={index}>
            <Tag
              color={event.type === 'delivery' ? 'blue' : 'orange'}
              style={{ marginBottom: 3 }}
            >
              {event.type === 'delivery' ? 'Livraison' : 'Maintenance'}
            </Tag>
          </li>
        ))}
      </ul>
    );
  };

  const getVehicleStatusTag = (status: string) => {
    const colors = {
      available: 'green',
      in_use: 'blue',
      maintenance: 'orange',
      out_of_service: 'red',
    };
    const labels = {
      available: 'Disponible',
      in_use: 'En service',
      maintenance: 'En maintenance',
      out_of_service: 'Hors service',
    };
    return <Tag color={colors[status]}>{labels[status]}</Tag>;
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="Planning des véhicules">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card title="Véhicules" size="small">
              <Select
                style={{ width: '100%', marginBottom: 16 }}
                placeholder="Sélectionner un véhicule"
                onChange={setSelectedVehicle}
                value={selectedVehicle}
              >
                {vehicles.map(vehicle => (
                  <Option key={vehicle.id} value={vehicle.id}>
                    <Row justify="space-between">
                      <Col>{vehicle.registrationNumber}</Col>
                      <Col>{getVehicleStatusTag(vehicle.status)}</Col>
                    </Row>
                  </Option>
                ))}
              </Select>

              <Button
                type="primary"
                block
                onClick={() => setModalVisible(true)}
                disabled={!selectedVehicle}
              >
                Ajouter un événement
              </Button>
            </Card>

            {selectedVehicle && (
              <Card title="Disponibilités" size="small" style={{ marginTop: 16 }}>
                <Select
                  style={{ width: '100%', marginBottom: 16 }}
                  value={availabilityView}
                  onChange={setAvailabilityView}
                >
                  <Option value="calendar">Vue calendrier</Option>
                  <Option value="timeline">Vue chronologique</Option>
                </Select>
              </Card>
            )}
          </Col>

          <Col span={18}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <LoadingOutlined style={{ fontSize: 24 }} />
              </div>
            ) : availabilityView === 'calendar' ? (
              <Calendar
                dateCellRender={dateCellRender}
                onChange={date => setSelectedDate(date)}
                value={selectedDate}
              />
            ) : (
              <VehicleTimeline
                events={events}
                onEventClick={(event) => {
                  // Gérer le clic sur un événement
                }}
              />
            )}
          </Col>
        </Row>
      </Card>

      <Modal
        title="Ajouter un événement"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEvent}
        >
          <Form.Item
            name="type"
            label="Type d'événement"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="maintenance">Maintenance</Option>
              <Option value="assignment">Attribution</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Date de début"
            rules={[{ required: true }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'assignment' && (
                <Form.Item
                  name="endDate"
                  label="Date de fin"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Ajouter
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehiclePlanningScreen;
