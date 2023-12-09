import React from 'react';
import './add-vendor.scss'; // Ensure you have the correct stylesheet imported
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { userApi, vendorApi } from '../../../../index';
import { useError } from '../../../error-component/error-context';

const { Option } = Select;

export interface IVendorData {
  'Vendor Name'?: string;
  'Vendor Address'?: string;
  'Is Government'?: string;
}

export default function AddVendor({
                                    isPopupVisible,
                                    hidePopup,
                                    vendorData,
                                    onAddVendorSuccess,
                                  }: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  vendorData: {
    newVendorData: IVendorData;
    setNewVendorData: (newVendorData: unknown) => void;
  };
  onAddVendorSuccess: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);
  const { showError } = useError();

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 16, span: 17 },
  };

  const onRoleChange = () => {
    console.log('Role changed');
  };

  const onFinish = async () => {
    const newVendorData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newVendorData) {
      if (newVendorData[key]) {
        check = true;
      }
    }

    const response = await vendorApi.addVendor({
      vendor_name: newVendorData['Vendor Name'],
      vendor_address: newVendorData['Vendor Address'],
      is_government: newVendorData['Is Government'] === 'true',
      vendor_owner_id: userApi.getUserData.user_id
    });

    if (response.success) {
      onAddVendorSuccess();
      if (!check) {
        hidePopup();
        handleReset();
      } else {
        hidePopup();
      }
    } else {
      showError(response.message);
    }
    vendorData.setNewVendorData(newVendorData);
  };

  const onCancel = () => {
    hidePopup();
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  return (
    <Modal
      title="Add New Vendor"
      visible={isPopupVisible}
      onOk={onFinish}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      className={'add-vendor-popup'}
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
          name="Vendor Name"
          label="Vendor Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="Vendor Address"
          label="Vendor Address"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="Is Government"
          label="Is Government"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select from following"
            onChange={onRoleChange}
            allowClear
          >
            <Option value="true">True</Option>
            <Option value="false">False</Option>
          </Select>
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
