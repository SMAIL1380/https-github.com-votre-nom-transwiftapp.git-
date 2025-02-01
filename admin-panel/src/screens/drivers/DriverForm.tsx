import React from 'react';
import { Form, Input, DatePicker, Button, Select } from 'antd';
import moment from 'moment';

interface Driver {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'active' | 'inactive' | 'on_delivery';
}

interface Props {
  initialValues?: Driver | null;
  onSubmit: (values: Partial<Driver>) => void;
  onCancel: () => void;
}

const DriverForm: React.FC<Props> = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Convert moment object to string for licenseExpiry
      const formattedValues = {
        ...values,
        licenseExpiry: values.licenseExpiry.format('YYYY-MM-DD'),
      };
      onSubmit(formattedValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        licenseExpiry: moment(initialValues.licenseExpiry),
      });
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues ? {
        ...initialValues,
        licenseExpiry: moment(initialValues.licenseExpiry),
      } : undefined}
    >
      <Form.Item
        name="firstName"
        label="Prénom"
        rules={[{ required: true, message: 'Le prénom est requis' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="lastName"
        label="Nom"
        rules={[{ required: true, message: 'Le nom est requis' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'L\'email est requis' },
          { type: 'email', message: 'Email invalide' },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Téléphone"
        rules={[{ required: true, message: 'Le numéro de téléphone est requis' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="licenseNumber"
        label="Numéro de permis"
        rules={[{ required: true, message: 'Le numéro de permis est requis' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="licenseExpiry"
        label="Date d'expiration du permis"
        rules={[{ required: true, message: 'La date d\'expiration est requise' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="status"
        label="Statut"
        rules={[{ required: true, message: 'Le statut est requis' }]}
      >
        <Select>
          <Select.Option value="active">Actif</Select.Option>
          <Select.Option value="inactive">Inactif</Select.Option>
          <Select.Option value="on_delivery">En livraison</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={handleSubmit} style={{ marginRight: 8 }}>
          {initialValues ? 'Mettre à jour' : 'Créer'}
        </Button>
        <Button onClick={onCancel}>
          Annuler
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DriverForm;
