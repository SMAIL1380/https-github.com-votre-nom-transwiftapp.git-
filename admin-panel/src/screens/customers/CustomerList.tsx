import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAPI } from '../../hooks/useAPI';
import CustomerForm from './CustomerForm';

interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  status: 'active' | 'inactive';
  type: 'business' | 'individual';
}

const CustomerList: React.FC = () => {
  const { api } = useAPI();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      message.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalVisible(true);
  };

  const handleDelete = async (customerId: string) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce client ?',
      onOk: async () => {
        try {
          await api.delete(`/customers/${customerId}`);
          message.success('Client supprimé avec succès');
          loadCustomers();
        } catch (error) {
          message.error('Erreur lors de la suppression du client');
        }
      },
    });
  };

  const handleFormSubmit = async (values: Partial<Customer>) => {
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, values);
        message.success('Client mis à jour avec succès');
      } else {
        await api.post('/customers', values);
        message.success('Client créé avec succès');
      }
      setIsModalVisible(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (error) {
      message.error('Erreur lors de l\'enregistrement du client');
    }
  };

  const columns = [
    {
      title: 'Entreprise',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a: Customer, b: Customer) => a.companyName.localeCompare(b.companyName),
    },
    {
      title: 'Contact',
      dataIndex: 'contactName',
      key: 'contactName',
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
      title: 'Ville',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'business' ? 'blue' : 'green'}>
          {type === 'business' ? 'Entreprise' : 'Particulier'}
        </Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Customer) => (
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
    <Card title="Gestion des Clients">
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Ajouter un client
      </Button>

      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingCustomer ? 'Modifier le client' : 'Ajouter un client'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCustomer(null);
        }}
        footer={null}
      >
        <CustomerForm
          initialValues={editingCustomer}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingCustomer(null);
          }}
        />
      </Modal>
    </Card>
  );
};

export default CustomerList;
