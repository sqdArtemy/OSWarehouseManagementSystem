import React, { useEffect } from 'react';
import './edit-item.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { productApi } from '../../../../index';
import { useError } from '../../../error-component/error-context';

export interface IEditItemData {
  'Product Name'?: string;
  Weight?: string;
  Volume?: string;
  Price?: string;
  Expiration?: string;
  'Storage type'?: string;
  Description?: string;
}

export default function EditItem({
                                   hidePopup,
                                   isEditPopupVisible, // Change isPopupVisible to isEditPopupVisible
                                   itemData,
                                   onEditItemSuccess,
                                 }: {
  hidePopup: () => void;
  isEditPopupVisible: boolean; // Change isPopupVisible to isEditPopupVisible
  itemData: {
    editItemData: IEditItemData;
    setEditItemData: (editItemData: unknown) => void;
  };
  onEditItemSuccess: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 16, span: 17 },
  };

  function onTypeChange() {
    console.log('change');
  }

  useEffect(() => {
    if (isEditPopupVisible && itemData.editItemData && formRef.current) {
      const {
        name, weight, volume, price, type, expiry_duration, is_stackable, description, product_id
      } = itemData.editItemData;

      const typeMapping = {
        "refrigerated": "Perishable (Refrigerator used)",
        "freezer": "Perishable (Freezer used)",
        "dry": "Nonperishable",
        "hazardous": "Hazard"
      };

      console.log(typeMapping[type]);
      formRef.current.setFieldsValue({
        'Product Name': name,
        'Weight': weight,
        'Volume': volume,
        'Price': price,
        'Average expiration time': itemData.editItemData['expiry-duration'],
        'Storage type': is_stackable === true ? 'Stackable' : 'Non-stackable',
        'Description': description,
        'Type': typeMapping[type],
      });
    }
  }, [itemData]);

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  const onCancel = () => {
    hidePopup();
    handleReset();
  };

  const { showError } = useError();

  const onFinish = async () => {
    const editItemData = formRef.current?.getFieldsValue();
    hidePopup();

    const typeMapping = {
      'perishable-refrigerator': 'refrigerated',
      'perishable-freezer': 'freezer',
      nonperishable: 'dry',
      hazard: 'hazardous',
    };

    const body = {
      product_name: editItemData['Product Name'],
      price: editItemData['Price'],
      product_type: typeMapping[editItemData['Type']],
      expiry_duration: editItemData['Average expiration time'] ?? null,
      description: editItemData['Description'],
      weight: editItemData['Weight'],
      volume: editItemData['Volume'],
      is_stackable: editItemData['Storage type'] === 'stackable',
    }

    if(editItemData['Product Name'] === itemData.editItemData.name){
      delete body.product_name;
    }

    const response = await productApi.updateProduct(body,
      itemData.editItemData?.product_id
    );

    if (response?.success) {
      onEditItemSuccess();
    } else {
      showError(response.message);
    }

    itemData.setEditItemData(editItemData);
  };

  function onRoleChange() {
    console.log('change');
  }

  return (
    <Modal
      title="Edit Item"
      visible={isEditPopupVisible}
      onOk={onFinish}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Form
        {...layout}
        labelAlign={'left'}
        ref={formRef}
        name="control-ref"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="Product Name"
          label="Product Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="Weight"
          label="Weight"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="Volume" label="Volume" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="Price" label="Price" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="Type" label="Type of product" rules={[{ required: true }]}>
          <Select
            placeholder="Select from following"
            onChange={onRoleChange}
            allowClear
          >
            <Option value="perishable-refrigerator">Perishable (Refrigerator used)</Option>
            <Option value="perishable-freezer">Perishable (Freezer used)</Option>
            <Option value="nonperishable">Nonperishable</Option>
            <Option value="hazard">Hazard</Option>
          </Select>
        </Form.Item>
        <Form.Item name="Average expiration time" label="Average expiration time" rules={[{ required: false }]}>
          <Input />
        </Form.Item>
        <Form.Item name="Storage type" label="Storage type" rules={[{ required: true }]}>
          <Select
            placeholder="Select from following"
            onChange={onRoleChange}
            allowClear
          >
            <Option value="stackable">Stackable</Option>
            <Option value="non-stackable">Non-stackable</Option>
          </Select>
        </Form.Item>
        <Form.Item name="Description" label="Description" rules={[{ required: true }]}>
          <textarea placeholder="Write the description of item here" rows={4} cols={45}/>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            htmlType="button"
            onClick={handleReset}
            style={{ marginRight: '1vw' }}
          >
            Reset
          </Button>

          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
