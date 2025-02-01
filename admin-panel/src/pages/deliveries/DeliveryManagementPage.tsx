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
  Tabs,
  Input,
  Select,
  Form,
  Row,
  Col,
  Statistic,
  Timeline,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  CarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { useAPI } from '../../hooks/useAPI';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const DeliveryManagementPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });
  const { api } = useAPI();

  useEffect(() => {
    loadDeliveries();
    loadStatistics();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/deliveries');
      setDeliveries(response.data);
    } catch (error) {
      message.error('Erreur lors du chargement des livraisons');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.get('/admin/deliveries/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleAssignDriver = async (deliveryId, driverId) => {
    try {
      await api.post(`/admin/deliveries/${deliveryId}/assign`, { driverId });
      message.success('Chauffeur assigné avec succès');
      loadDeliveries();
    } catch (error) {
      message.error('Erreur lors de l\'assignation du chauffeur');
    }
  };

  const handleCancelDelivery = async (deliveryId) => {
    try {
      await api.post(`/admin/deliveries/${deliveryId}/cancel`);
      message.success('Livraison annulée avec succès');
      loadDeliveries();
    } catch (error) {
      message.error('Erreur lors de l\'annulation de la livraison');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      accepted: 'blue',
      picked_up: 'cyan',
      in_progress: 'geekblue',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Client',
      dataIndex: ['client', 'fullName'],
      key: 'client',
    },
    {
      title: 'Chauffeur',
      dataIndex: ['driver', 'fullName'],
      key: 'driver',
      render: (text, record) => text || (
        <Button
          type="link"
          onClick={() => setSelectedDelivery({ ...record, showDriverAssignment: true })}
        >
          Assigner un chauffeur
        </Button>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Collecte',
      dataIndex: 'pickupAddress',
      key: 'pickup',
      render: (text) => (
        <Text ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Livraison',
      dataIndex: 'deliveryAddress',
      key: 'delivery',
      render: (text) => (
        <Text ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EnvironmentOutlined />}
            onClick={() => setSelectedDelivery({ ...record, showMap: true })}
          >
            Suivre
          </Button>
          <Button
            type="default"
            onClick={() => setSelectedDelivery({ ...record, showDetails: true })}
          >
            Détails
          </Button>
          {record.status === 'pending' && (
            <Button
              type="danger"
              icon={<CloseOutlined />}
              onClick={() => handleCancelDelivery(record.id)}
            >
              Annuler
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const renderDeliveryDetails = () => {
    if (!selectedDelivery) return null;

    return (
      <Modal
        title="Détails de la livraison"
        visible={selectedDelivery.showDetails}
        onCancel={() => setSelectedDelivery(null)}
        width={800}
        footer={null}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Informations" key="1">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Client">
                  <p><strong>Nom:</strong> {selectedDelivery.client.fullName}</p>
                  <p><strong>Téléphone:</strong> {selectedDelivery.client.phone}</p>
                  <p><strong>Email:</strong> {selectedDelivery.client.email}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Chauffeur">
                  {selectedDelivery.driver ? (
                    <>
                      <p><strong>Nom:</strong> {selectedDelivery.driver.fullName}</p>
                      <p><strong>Téléphone:</strong> {selectedDelivery.driver.phone}</p>
                      <p><strong>Type:</strong> {selectedDelivery.driver.driverType}</p>
                    </>
                  ) : (
                    <Text type="secondary">Pas encore assigné</Text>
                  )}
                </Card>
              </Col>
            </Row>

            <Card title="Colis" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Poids"
                    value={selectedDelivery.packageDetails.weight}
                    suffix="kg"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Dimensions"
                    value={selectedDelivery.packageDetails.dimensions}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Type"
                    value={selectedDelivery.packageDetails.type}
                  />
                </Col>
              </Row>
            </Card>

            <Card title="Timeline" style={{ marginTop: 16 }}>
              <Timeline>
                {selectedDelivery.acceptedAt && (
                  <Timeline.Item color="blue">
                    Acceptée le {new Date(selectedDelivery.acceptedAt).toLocaleString()}
                  </Timeline.Item>
                )}
                {selectedDelivery.pickedUpAt && (
                  <Timeline.Item color="cyan">
                    Collectée le {new Date(selectedDelivery.pickedUpAt).toLocaleString()}
                  </Timeline.Item>
                )}
                {selectedDelivery.startedAt && (
                  <Timeline.Item color="geekblue">
                    Démarrée le {new Date(selectedDelivery.startedAt).toLocaleString()}
                  </Timeline.Item>
                )}
                {selectedDelivery.completedAt && (
                  <Timeline.Item color="green">
                    Terminée le {new Date(selectedDelivery.completedAt).toLocaleString()}
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </TabPane>

          <TabPane tab="Preuve de livraison" key="2">
            {selectedDelivery.deliveryProof ? (
              <Row gutter={[16, 16]}>
                {selectedDelivery.deliveryProof.signature && (
                  <Col span={12}>
                    <Card title="Signature">
                      <img
                        src={selectedDelivery.deliveryProof.signature}
                        alt="Signature"
                        style={{ width: '100%' }}
                      />
                    </Card>
                  </Col>
                )}
                {selectedDelivery.deliveryProof.photo && (
                  <Col span={12}>
                    <Card title="Photo">
                      <img
                        src={selectedDelivery.deliveryProof.photo}
                        alt="Preuve de livraison"
                        style={{ width: '100%' }}
                      />
                    </Card>
                  </Col>
                )}
                {selectedDelivery.deliveryProof.note && (
                  <Col span={24}>
                    <Card title="Note">
                      <Text>{selectedDelivery.deliveryProof.note}</Text>
                    </Card>
                  </Col>
                )}
              </Row>
            ) : (
              <Text type="secondary">Pas encore de preuve de livraison</Text>
            )}
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  const renderMap = () => {
    if (!selectedDelivery?.showMap) return null;

    return (
      <Modal
        title="Suivi de livraison"
        visible={true}
        onCancel={() => setSelectedDelivery(null)}
        width={800}
        footer={null}
      >
        <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ height: '400px', width: '100%' }}
            center={selectedDelivery.pickupLocation}
            zoom={13}
          >
            <Marker
              position={selectedDelivery.pickupLocation}
              label="P"
              title="Point de collecte"
            />
            <Marker
              position={selectedDelivery.deliveryLocation}
              label="L"
              title="Point de livraison"
            />
            {selectedDelivery.currentLocation && (
              <Marker
                position={selectedDelivery.currentLocation}
                icon={{
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 6,
                }}
                title="Position actuelle du chauffeur"
              />
            )}
            {selectedDelivery.route?.coordinates && (
              <Polyline
                path={selectedDelivery.route.coordinates}
                options={{
                  strokeColor: '#2196F3',
                  strokeWeight: 3,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>

        <Card style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Distance estimée"
                value={selectedDelivery.route?.estimatedDistance || 0}
                suffix="km"
                prefix={<EnvironmentOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Durée estimée"
                value={selectedDelivery.route?.estimatedDuration || 0}
                suffix="min"
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Dernière mise à jour"
                value={selectedDelivery.lastLocationUpdate ? new Date(selectedDelivery.lastLocationUpdate).toLocaleTimeString() : 'N/A'}
                prefix={<CarOutlined />}
              />
            </Col>
          </Row>
        </Card>
      </Modal>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Gestion des livraisons</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total"
              value={statistics.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="En attente"
              value={statistics.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="En cours"
              value={statistics.inProgress}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Terminées"
              value={statistics.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Annulées"
              value={statistics.cancelled}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={deliveries}
          loading={loading}
          rowKey="id"
        />
      </Card>

      {renderDeliveryDetails()}
      {renderMap()}
    </div>
  );
};

export default DeliveryManagementPage;
