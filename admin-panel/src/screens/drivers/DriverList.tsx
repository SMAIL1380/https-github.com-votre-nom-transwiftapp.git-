import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useAPI } from '../../hooks/useAPI';
import DriverForm from './DriverForm';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'active' | 'inactive' | 'on_delivery';
  rating: number;
}

const DriverList: React.FC = () => {
  const { api } = useAPI();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      message.error('Erreur lors du chargement des chauffeurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsModalVisible(true);
  };

  const handleDelete = async (driverId: string) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce chauffeur ?',
      onOk: async () => {
        try {
          await api.delete(`/drivers/${driverId}`);
          message.success('Chauffeur supprimé avec succès');
          loadDrivers();
        } catch (error) {
          message.error('Erreur lors de la suppression du chauffeur');
        }
      },
    });
  };

  const handleFormSubmit = async (values: Partial<Driver>) => {
    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, values);
        message.success('Chauffeur mis à jour avec succès');
      } else {
        await api.post('/drivers', values);
        message.success('Chauffeur créé avec succès');
      }
      setIsModalVisible(false);
      setEditingDriver(null);
      loadDrivers();
    } catch (error) {
      message.error('Erreur lors de l\'enregistrement du chauffeur');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      inactive: 'red',
      on_delivery: 'blue',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a: Driver, b: Driver) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'Prénom',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Téléphone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Numéro de permis',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Note',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => `${rating}/5`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Driver) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Gestion des Chauffeurs">
      <Button
        type="primary"
        icon={<UserOutlined />}
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Ajouter un chauffeur
      </Button>

      <Table
        columns={columns}
        dataSource={drivers}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingDriver ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingDriver(null);
        }}
        footer={null}
      >
        <DriverForm
          initialValues={editingDriver}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingDriver(null);
          }}
        />
      </Modal>
    </Card>
  );
};

export default DriverList;
