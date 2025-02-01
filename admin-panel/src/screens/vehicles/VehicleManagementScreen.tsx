import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Tabs,
} from 'antd';
import {
  CarOutlined,
  ToolOutlined,
  UserOutlined,
  GasPumpOutlined,
} from '@ant-design/icons';
import { useAPI } from '../../hooks/useAPI';
import { Vehicle, VehicleStatus, VehicleType, FuelType } from '../../types/vehicle';
import MaintenanceRecordList from './MaintenanceRecordList';
import VehicleStatsChart from './VehicleStatsChart';

const { TabPane } = Tabs;

const VehicleManagementScreen: React.FC = () => {
  const { api } = useAPI();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = async (values: any) => {
    try {
      if (selectedVehicle) {
        await api.put(`/vehicles/${selectedVehicle.id}`, values);
      } else {
        await api.post('/vehicles', values);
      }
      setModalVisible(false);
      loadVehicles();
      form.resetFields();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const getStatusColor = (status: VehicleStatus) => {
    const colors = {
      available: 'green',
      in_use: 'blue',
      maintenance: 'orange',
      out_of_service: 'red',
    };
    return colors[status];
  };

  const columns = [
    {
      title: 'Immatriculation',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: VehicleType) => {
        const labels = {
          car: 'Voiture',
          van: 'Camionnette',
          truck: 'Camion',
          motorcycle: 'Moto',
        };
        return labels[type];
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: VehicleStatus) => (
        <Tag color={getStatusColor(status)}>
          {status === 'available'
            ? 'Disponible'
            : status === 'in_use'
            ? 'En service'
            : status === 'maintenance'
            ? 'En maintenance'
            : 'Hors service'}
        </Tag>
      ),
    },
    {
      title: 'Conducteur actuel',
      dataIndex: ['currentDriver', 'name'],
      key: 'currentDriver',
      render: (name: string) => name || '-',
    },
    {
      title: 'Kilométrage',
      dataIndex: 'mileage',
      key: 'mileage',
      render: (mileage: number) => `${mileage.toLocaleString()} km`,
    },
    {
      title: 'Niveau carburant',
      dataIndex: 'currentFuelLevel',
      key: 'currentFuelLevel',
      render: (level: number, record: Vehicle) => (
        <Progress
          percent={(level / record.fuelCapacity) * 100}
          size="small"
          status={level < record.fuelCapacity * 0.2 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Vehicle) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setSelectedVehicle(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Modifier
          </Button>
          <Button
            onClick={() => showVehicleDetails(record)}
          >
            Détails
          </Button>
        </Space>
      ),
    },
  ];

  const showVehicleDetails = (vehicle: Vehicle) => {
    Modal.info({
      title: `Détails du véhicule - ${vehicle.registrationNumber}`,
      width: 800,
      content: (
        <Tabs defaultActiveKey="1">
          <TabPane tab="Informations générales" key="1">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Kilométrage total"
                  value={vehicle.totalDistance}
                  suffix="km"
                  prefix={<CarOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Livraisons totales"
                  value={vehicle.totalDeliveries}
                  prefix={<ShoppingOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Prochaine maintenance"
                  value={vehicle.nextMaintenanceDate}
                  prefix={<ToolOutlined />}
                />
              </Col>
            </Row>
            <VehicleStatsChart vehicleId={vehicle.id} />
          </TabPane>
          <TabPane tab="Historique des maintenances" key="2">
            <MaintenanceRecordList vehicleId={vehicle.id} />
          </TabPane>
        </Tabs>
      ),
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Gestion des véhicules"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setSelectedVehicle(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Ajouter un véhicule
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={vehicles}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title={selectedVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEdit}
        >
          <Form.Item
            name="registrationNumber"
            label="Immatriculation"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="car">Voiture</Select.Option>
              <Select.Option value="van">Camionnette</Select.Option>
              <Select.Option value="truck">Camion</Select.Option>
              <Select.Option value="motorcycle">Moto</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="brand"
            label="Marque"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="model"
            label="Modèle"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="year"
            label="Année"
            rules={[{ required: true }]}
          >
            <InputNumber min={1900} max={2025} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="fuelType"
            label="Type de carburant"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="gasoline">Essence</Select.Option>
              <Select.Option value="diesel">Diesel</Select.Option>
              <Select.Option value="electric">Électrique</Select.Option>
              <Select.Option value="hybrid">Hybride</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="fuelCapacity"
            label="Capacité de carburant (L)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxLoadWeight"
            label="Charge maximale (kg)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedVehicle ? 'Mettre à jour' : 'Ajouter'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehicleManagementScreen;
