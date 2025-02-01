import React from 'react';
import { Form, Input, Button, Select } from 'antd';

interface Customer {
  id?: string;
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

interface Props {
  initialValues?: Customer | null;
  onSubmit: (values: Partial<Customer>) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<Props> = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <Form.Item
        name="type"
        label="Type de client"
        rules={[{ required: true, message: 'Le type de client est requis' }]}
      >
        <Select>
          <Select.Option value="business">Entreprise</Select.Option>
          <Select.Option value="individual">Particulier</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="companyName"
        label="Nom de l'entreprise"
        rules={[{ required: true, message: 'Le nom de l\'entreprise est requis' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="contactName"
        label="Nom du contact"
        rules={[{ required: true, message: 'Le nom du contact est requis' }]}
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
        name="address"
        label="Adresse"
        rules={[{ required: true, message: 'L\'adresse est requise' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="city"
        label="Ville"
        rules={[{ required: true, message: 'La ville est requise' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="postalCode"
        label="Code postal"
        rules={[{ required: true, message: 'Le code postal est requis' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="country"
        label="Pays"
        rules={[{ required: true, message: 'Le pays est requis' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="status"
        label="Statut"
        rules={[{ required: true, message: 'Le statut est requis' }]}
      >
        <Select>
          <Select.Option value="active">Actif</Select.Option>
          <Select.Option value="inactive">Inactif</Select.Option>
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

export default CustomerForm;
