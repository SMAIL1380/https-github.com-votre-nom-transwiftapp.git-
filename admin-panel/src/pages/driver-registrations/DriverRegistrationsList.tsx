import React, { useState, useEffect } from 'react';
import {
  Table,
  Space,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Card,
  Drawer,
  Descriptions,
  Image,
} from 'antd';
import { ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { getDriverRegistrations, approveRegistration, rejectRegistration } from '../../services/driverRegistration';
import { formatDate } from '../../utils/dateUtils';

const { Title } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const statusColors = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
  COMPLETED: 'blue',
};

const DriverRegistrationsList = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await getDriverRegistrations();
      setRegistrations(data);
    } catch (error) {
      message.error('Erreur lors du chargement des inscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const showApproveConfirm = (registration) => {
    confirm({
      title: 'Confirmer l\'approbation',
      icon: <ExclamationCircleOutlined />,
      content: 'Êtes-vous sûr de vouloir approuver cette inscription ? Un email sera envoyé au chauffeur avec un lien d\'activation.',
      onOk: async () => {
        try {
          await approveRegistration(registration.id);
          message.success('Inscription approuvée avec succès');
          fetchRegistrations();
        } catch (error) {
          message.error('Erreur lors de l\'approbation');
        }
      },
    });
  };

  const handleReject = async (values) => {
    try {
      await rejectRegistration(selectedRegistration.id, values.reason);
      message.success('Inscription rejetée');
      setRejectModalVisible(false);
      rejectForm.resetFields();
      fetchRegistrations();
    } catch (error) {
      message.error('Erreur lors du rejet');
    }
  };

  const showDocumentPreview = (url, title) => {
    Modal.info({
      title,
      width: 800,
      content: (
        <div style={{ textAlign: 'center' }}>
          {url.endsWith('.pdf') ? (
            <iframe
              src={url}
              width="100%"
              height="500px"
              title={title}
            />
          ) : (
            <Image
              src={url}
              alt={title}
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
          )}
        </div>
      ),
    });
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Nom',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Téléphone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Entreprise',
      dataIndex: ['companyInfo', 'companyName'],
      key: 'companyName',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRegistration(record);
              setDrawerVisible(true);
            }}
          >
            Détails
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                onClick={() => showApproveConfirm(record)}
              >
                Approuver
              </Button>
              <Button
                danger
                onClick={() => {
                  setSelectedRegistration(record);
                  setRejectModalVisible(true);
                }}
              >
                Rejeter
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Inscriptions des chauffeurs</Title>

      <Card>
        <Table
          columns={columns}
          dataSource={registrations}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title="Motif du rejet"
        visible={rejectModalVisible}
        onOk={() => rejectForm.submit()}
        onCancel={() => {
          setRejectModalVisible(false);
          rejectForm.resetFields();
        }}
      >
        <Form form={rejectForm} onFinish={handleReject}>
          <Form.Item
            name="reason"
            rules={[{ required: true, message: 'Veuillez indiquer le motif du rejet' }]}
          >
            <TextArea rows={4} placeholder="Motif du rejet" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Détails de l'inscription"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        {selectedRegistration && (
          <>
            <Descriptions title="Informations personnelles" column={1}>
              <Descriptions.Item label="Nom complet">
                {`${selectedRegistration.firstName} ${selectedRegistration.lastName}`}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedRegistration.email}
              </Descriptions.Item>
              <Descriptions.Item label="Téléphone">
                {selectedRegistration.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="N° de permis">
                {selectedRegistration.licenseNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Date d'expiration du permis">
                {formatDate(selectedRegistration.licenseExpiryDate)}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Informations de l'entreprise" column={1}>
              <Descriptions.Item label="Nom de l'entreprise">
                {selectedRegistration.companyInfo?.companyName}
              </Descriptions.Item>
              <Descriptions.Item label="N° d'enregistrement">
                {selectedRegistration.companyInfo?.registrationNumber}
              </Descriptions.Item>
              <Descriptions.Item label="N° de TVA">
                {selectedRegistration.companyInfo?.taxIdentificationNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Adresse">
                {selectedRegistration.companyInfo?.address}
              </Descriptions.Item>
            </Descriptions>

            <Title level={4} style={{ marginTop: '24px' }}>Documents</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                block
                onClick={() => showDocumentPreview(selectedRegistration.licenseDocument, 'Permis de conduire')}
              >
                Voir le permis de conduire
              </Button>
              <Button
                block
                onClick={() => showDocumentPreview(selectedRegistration.insuranceDocument, 'Attestation d\'assurance')}
              >
                Voir l'attestation d'assurance
              </Button>
              <Button
                block
                onClick={() => showDocumentPreview(selectedRegistration.registrationDocument, 'K-bis')}
              >
                Voir le K-bis
              </Button>
            </Space>

            {selectedRegistration.status === 'REJECTED' && (
              <Card title="Motif du rejet" style={{ marginTop: '24px' }}>
                <p>{selectedRegistration.adminComment}</p>
              </Card>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default DriverRegistrationsList;
