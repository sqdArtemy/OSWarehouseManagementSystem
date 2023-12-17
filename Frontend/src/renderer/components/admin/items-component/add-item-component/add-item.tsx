import React, { useEffect } from 'react';
import './add-item.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { companyApi, productApi } from '../../../../index';
import { useError } from '../../../result-handler-component/error-component/error-context';

export interface IItemData {
  'Product Name'?: string;
  Weight?: string;
  Volume?: string;
  Price?: string;
  Expiration?: string;
  'Storage type'?: string;
  Description?: string;
}

export default function AddItem({
  isPopupVisible,
  hidePopup,
  itemData,
  onAddItemSuccess,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  itemData: {
    newItemData: IItemData;
    setNewItemData: (newItemData: unknown) => void;
  };
  onAddItemSuccess: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);
  const [companyOptions, setCompanyOptions] = React.useState<
    Select['OptionType'][]
  >([]);
  const { showError } = useError();

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 16, span: 17 },
  };

  function onRoleChange() {
    console.log('change');
  }

  const onFinish = async () => {
    const newitemData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newitemData) {
      if (newitemData[key]) {
        check = true;
      }
    }
    const typeMapping = {
      'perishable-refrigerator': 'refrigerated',
      'perishable-freezer': 'freezer',
      nonperishable: 'dry',
      hazard: 'hazardous',
    };

    const response = await productApi.addProduct({
      product_name: newitemData['Product Name'],
      price: newitemData['Price'],
      product_type: typeMapping[newitemData['Type of product']],
      expiry_duration: newitemData['Average expiration time'] ?? null,
      description: newitemData['Description'],
      weight: newitemData['Weight'],
      volume: newitemData['Volume'],
      is_stackable: newitemData['Storage type'] === 'stackable',
      company_id: newitemData['Company'],
    });

    if (response.success) {
      onAddItemSuccess();
      if (!check) {
        hidePopup();
        handleReset();
      } else {
        hidePopup();
      }
    } else {
      showError(response.message);
    }
    itemData.setNewItemData(newitemData);
  };

  const onCancel = () => {
    hidePopup();
    // handleReset();
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  useEffect(() => {
    if (isPopupVisible && formRef.current) {
      companyApi.getAll().then((res) => {
        const companies = res.data.body;

        setCompanyOptions(
          companies.map((company) => {
            return {
              value: company.company_id,
              label: company.company_name,
            };
          }),
        );
      });
    }
  }, [isPopupVisible]);

  return (
    <Modal
      title="Add New Item"
      open={isPopupVisible}
      onOk={onFinish}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      className={'add-item-popup'}
      style={{ top: '3vw' }}
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
          name="Company"
          label={<p style={{ fontSize: '1vw' }}>Company</p>}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={'Select a Company'}
            style={{ minHeight: '2vw' }}
            options={companyOptions}
          />
        </Form.Item>
        <Form.Item
          name="Product Name"
          label="Product Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="Weight"
          label="Weight (kg)"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="Volume"
          label={
            <p>
              Volume m<sup>3</sup>
            </p>
          }
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="Price" label="Price $" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="Type of product"
          label="Type of product"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select from following"
            onChange={onRoleChange}
            allowClear
          >
            <Option value="perishable-refrigerator">
              Perishable (Refrigerator used)
            </Option>
            <Option value="perishable-freezer">
              Perishable (Freezer used)
            </Option>
            <Option value="nonperishable">Nonperishable</Option>
            <Option value="hazard">Hazard</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="Average expiration time"
          label="Average expiration time"
          rules={[{ required: false }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="Storage type"
          label="Storage type"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select from following"
            onChange={onRoleChange}
            allowClear
          >
            <Option value="stackable">Stackable</Option>
            <Option value="non-stackable">Non-stackable</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="Description"
          label="Description"
          rules={[{ required: true }]}
        >
          <textarea
            placeholder="Write the description of item here"
            rows={4}
            cols={45}
            style={{ resize: 'none' }}
          />
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
