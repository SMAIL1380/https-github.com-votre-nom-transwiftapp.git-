import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Tag,
  Modal,
  message,
  Typography,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useAPI } from '../../hooks/useAPI';

const { Title } = Typography;

const BankDetailsPage = () => {
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const { api } = useAPI();

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/drivers/bank-details');
      setBankDetails(response.data);
    } catch (error) {
      message.error('Erreur lors du chargement des informations bancaires');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (driverId) => {
    try {
      await api.post(`/admin/drivers/${driverId}/verify-bank-details`);
      message.success('Informations bancaires vérifiées avec succès');
      loadBankDetails();
    } catch (error) {
      message.error('Erreur lors de la vérification');
    }
  };

  const columns = [
    {
      title: 'Chauffeur',
      dataIndex: ['driver', 'fullName'],
      key: 'driverName',
    },
    {
      title: 'IBAN',
      dataIndex: 'iban',
      key: 'iban',
      render: (iban) => `${iban.slice(0, 4)}...${iban.slice(-4)}`,
    },
    {
      title: 'BIC',
      dataIndex: 'bic',
      key: 'bic',
    },
    {
      title: 'Statut',
      dataIndex: 'isVerified',
      key: 'status',
      render: (isVerified) => (
        <Tag color={isVerified ? 'green' : 'orange'}>
          {isVerified ? 'Vérifié' : 'En attente'}
        </Tag>
      ),
    },
    {
      title: 'Dernière mise à jour',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleVerify(record.driverId)}
            disabled={record.isVerified}
          >
            Vérifier
          </Button>
          <Button
            type="default"
            onClick={() => setSelectedDriver(record)}
          >
            Détails
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Gestion des informations bancaires</Title>
      
      <Card>
        <Table
          columns={columns}
          dataSource={bankDetails}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title="Détails bancaires"
        visible={!!selectedDriver}
        onCancel={() => setSelectedDriver(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedDriver(null)}>
            Fermer
          </Button>,
        ]}
      >
        {selectedDriver && (
          <div>
            <p><strong>Chauffeur:</strong> {selectedDriver.driver.fullName}</p>
            <p><strong>Email:</strong> {selectedDriver.driver.email}</p>
            <p><strong>IBAN:</strong> {selectedDriver.iban}</p>
            <p><strong>BIC:</strong> {selectedDriver.bic}</p>
            <p><strong>Statut:</strong> {selectedDriver.isVerified ? 'Vérifié' : 'En attente'}</p>
            <p><strong>Dernière mise à jour:</strong> {new Date(selectedDriver.lastUpdated).toLocaleString()}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BankDetailsPage;
