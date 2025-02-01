import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Tooltip,
  Tag,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CopyOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useAPI } from '../../hooks/useAPI';

const { Option } = Select;
const { TextArea } = Input;

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  titleTemplate: string;
  bodyTemplate: string;
  defaultPriority: string;
  defaultActions: any[];
}

const NotificationTemplateManager: React.FC = () => {
  const { api } = useAPI();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.get('/notification-templates');
      setTemplates(response.data);
    } catch (error) {
      message.error('Erreur lors du chargement des templates');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTemplate) {
        await api.put(`/notification-templates/${editingTemplate.name}`, values);
        message.success('Template mis à jour avec succès');
      } else {
        await api.post('/notification-templates', values);
        message.success('Template créé avec succès');
      }
      setModalVisible(false);
      loadTemplates();
    } catch (error) {
      message.error('Erreur lors de la sauvegarde du template');
    }
  };

  const handleDelete = async (template: NotificationTemplate) => {
    try {
      await api.delete(`/notification-templates/${template.name}`);
      message.success('Template supprimé avec succès');
      loadTemplates();
    } catch (error) {
      message.error('Erreur lors de la suppression du template');
    }
  };

  const handlePreview = (template: NotificationTemplate) => {
    const sampleData = {
      deliveryId: 'DEL123',
      address: '123 Rue Example',
      vehicleNumber: 'VH-456',
      daysUntil: 3,
      maintenanceType: 'vidange',
      fuelLevel: 25,
    };

    setPreviewData({
      template,
      preview: {
        title: template.titleTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => sampleData[key] || ''),
        body: template.bodyTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => sampleData[key] || ''),
      },
    });
    setPreviewModalVisible(true);
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={
          type === 'delivery' ? 'blue' :
          type === 'maintenance' ? 'orange' :
          type === 'alert' ? 'red' :
          'default'
        }>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Priorité par défaut',
      dataIndex: 'defaultPriority',
      key: 'defaultPriority',
      render: (priority: string) => (
        <Tag color={
          priority === 'high' ? 'red' :
          priority === 'normal' ? 'blue' :
          'green'
        }>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, template: NotificationTemplate) => (
        <Space>
          <Tooltip title="Prévisualiser">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handlePreview(template)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingTemplate(template);
                form.setFieldsValue(template);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Dupliquer">
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                setEditingTemplate(null);
                form.setFieldsValue({
                  ...template,
                  name: `${template.name}_copy`,
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(template)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Gestion des Templates de Notification"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTemplate(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Nouveau Template
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={templates}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTemplate ? 'Modifier le Template' : 'Nouveau Template'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Nom"
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
              <Option value="delivery">Livraison</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="fuel">Carburant</Option>
              <Option value="alert">Alerte</Option>
              <Option value="system">Système</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="titleTemplate"
            label="Template du Titre"
            rules={[{ required: true }]}
            tooltip="Utilisez {{variable}} pour les variables dynamiques"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="bodyTemplate"
            label="Template du Corps"
            rules={[{ required: true }]}
            tooltip="Utilisez {{variable}} pour les variables dynamiques"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="defaultPriority"
            label="Priorité par défaut"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="low">Basse</Option>
              <Option value="normal">Normale</Option>
              <Option value="high">Haute</Option>
              <Option value="urgent">Urgente</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTemplate ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Prévisualisation du Template"
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Fermer
          </Button>
        ]}
      >
        {previewData && (
          <div>
            <h3>Titre:</h3>
            <p>{previewData.preview.title}</p>
            <h3>Corps:</h3>
            <p>{previewData.preview.body}</p>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default NotificationTemplateManager;
