import React, { useState } from 'react';
import {
  Form,
  Select,
  DatePicker,
  InputNumber,
  Card,
  Button,
  Table,
  Tag,
  Space,
  Tooltip,
  Row,
  Col,
} from 'antd';
import {
  CarOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { useAPI } from '../../hooks/useAPI';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface SearchCriteria {
  timeRange: [moment.Moment, moment.Moment];
  vehicleTypes?: string[];
  minCapacity?: number;
  maxDistance?: number;
  fuelTypes?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

const AdvancedVehicleSearch: React.FC = () => {
  const { api } = useAPI();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (values: SearchCriteria) => {
    try {
      setLoading(true);
      const response = await api.post('/vehicles/search', {
        startTime: values.timeRange[0].toISOString(),
        endTime: values.timeRange[1].toISOString(),
        vehicleTypes: values.vehicleTypes,
        minCapacity: values.minCapacity,
        maxDistance: values.maxDistance,
        fuelTypes: values.fuelTypes,
        location: values.location,
      });

      setResults(response.data);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Véhicule',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      render: (text: string, record: any) => (
        <Space>
          <CarOutlined />
          <span>{text}</span>
          <Tag color="blue">{record.type}</Tag>
        </Space>
      ),
    },
    {
      title: 'Capacité',
      dataIndex: 'maxLoadWeight',
      key: 'maxLoadWeight',
      render: (weight: number) => `${weight} kg`,
      sorter: (a: any, b: any) => a.maxLoadWeight - b.maxLoadWeight,
    },
    {
      title: 'Type de carburant',
      dataIndex: 'fuelType',
      key: 'fuelType',
      render: (type: string) => {
        const colors = {
          gasoline: 'orange',
          diesel: 'purple',
          electric: 'green',
          hybrid: 'cyan',
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
      filters: [
        { text: 'Essence', value: 'gasoline' },
        { text: 'Diesel', value: 'diesel' },
        { text: 'Électrique', value: 'electric' },
        { text: 'Hybride', value: 'hybrid' },
      ],
      onFilter: (value: string, record: any) => record.fuelType === value,
    },
    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
      render: (distance: number) =>
        distance ? `${distance.toFixed(1)} km` : 'N/A',
      sorter: (a: any, b: any) => (a.distance || 0) - (b.distance || 0),
    },
    {
      title: 'Disponibilité',
      dataIndex: 'availability',
      key: 'availability',
      render: (availability: any) => (
        <Tooltip title={`${availability.hours} heures disponibles`}>
          <Progress
            percent={(availability.hours / 24) * 100}
            size="small"
            status={availability.hours > 12 ? 'success' : 'normal'}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: any) => (
        <Space>
          <Button type="primary" size="small">
            Réserver
          </Button>
          <Button size="small">Détails</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Recherche avancée de véhicules">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="timeRange"
              label="Période"
              rules={[{ required: true }]}
            >
              <RangePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="vehicleTypes"
              label="Types de véhicules"
            >
              <Select mode="multiple" placeholder="Tous les types">
                <Option value="car">Voiture</Option>
                <Option value="van">Camionnette</Option>
                <Option value="truck">Camion</Option>
                <Option value="motorcycle">Moto</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="fuelTypes"
              label="Types de carburant"
            >
              <Select mode="multiple" placeholder="Tous les carburants">
                <Option value="gasoline">Essence</Option>
                <Option value="diesel">Diesel</Option>
                <Option value="electric">Électrique</Option>
                <Option value="hybrid">Hybride</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="minCapacity"
              label="Capacité minimale (kg)"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={100}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="maxDistance"
              label="Distance maximale (km)"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={5}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                Rechercher
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        columns={columns}
        dataSource={results}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} véhicules`,
        }}
      />
    </Card>
  );
};

export default AdvancedVehicleSearch;
