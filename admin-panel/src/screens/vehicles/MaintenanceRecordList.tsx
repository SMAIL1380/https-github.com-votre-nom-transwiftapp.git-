import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, InputNumber, DatePicker } from 'antd';
import { useAPI } from '../../hooks/useAPI';
import { MaintenanceRecord, MaintenanceType } from '../../types/vehicle';

interface Props {
  vehicleId: string;
}

const MaintenanceRecordList: React.FC<Props> = ({ vehicleId }) => {
  const { api } = useAPI();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRecords();
  }, [vehicleId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vehicles/${vehicleId}/maintenance`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error loading maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (values: any) => {
    try {
      await api.post(`/vehicles/${vehicleId}/maintenance`, values);
      setModalVisible(false);
      loadRecords();
      form.resetFields();
    } catch (error) {
      console.error('Error adding maintenance record:', error);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: MaintenanceType) => {
        const colors = {
          routine: 'green',
          repair: 'orange',
          inspection: 'blue',
          emergency: 'red',
        };
        const labels = {
          routine: 'Routine',
          repair: 'Réparation',
          inspection: 'Inspection',
          emergency: 'Urgence',
        };
        return <Tag color={colors[type]}>{labels[type]}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Coût',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) =>
        new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(cost),
    },
    {
      title: 'Kilométrage',
      dataIndex: 'mileageAtService',
      key: 'mileageAtService',
      render: (mileage: number) => `${mileage.toLocaleString()} km`,
    },
    {
      title: 'Statut',
      dataIndex: 'isResolved',
      key: 'isResolved',
      render: (isResolved: boolean) => (
        <Tag color={isResolved ? 'green' : 'orange'}>
          {isResolved ? 'Résolu' : 'En cours'}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => setModalVisible(true)}
        >
          Ajouter une maintenance
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={records}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title="Ajouter une maintenance"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddRecord}
        >
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="routine">Routine</Select.Option>
              <Select.Option value="repair">Réparation</Select.Option>
              <Select.Option value="inspection">Inspection</Select.Option>
              <Select.Option value="emergency">Urgence</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="cost"
            label="Coût"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/€\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="serviceProvider"
            label="Prestataire"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="mileageAtService"
            label="Kilométrage"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="nextServiceDate"
            label="Prochaine maintenance prévue"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="isResolved"
            label="Statut"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value={true}>Résolu</Select.Option>
              <Select.Option value={false}>En cours</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
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
    </>
  );
};

export default MaintenanceRecordList;
