import React, { useEffect } from 'react';
import './edit-vendor.scss'; // Ensure you have the correct stylesheet imported
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { userApi, vendorApi } from '../../../../index';
import { useError } from '../../../error-component/error-context';

const { Option } = Select;

export interface IVendorData {
  'Vendor Name'?: string;
  'Vendor Address'?: string;
  'Is Government'?: string;
}

export default function EditVendor({
                                     hidePopup,
                                     isEditPopupVisible, // Change isPopupVisible to isEditPopupVisible
                                     vendorData,
                                     onEditVendorSuccess,
                                   }: {
  hidePopup: () => void;
  isEditPopupVisible: boolean; // Change isPopupVisible to isEditPopupVisible
  vendorData: {
    editVendorData: IVendorData;
    setEditVendorData: (editVendorData: unknown) => void;
  };
  onEditVendorSuccess: () => void;
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

  useEffect(() => {
    if (isEditPopupVisible && vendorData.editVendorData && formRef.current) {
      const {
        vendor_name,
        vendor_address,
        is_government,
      } = vendorData.editVendorData;

      formRef.current.setFieldsValue({
        'Vendor Name': vendor_name,
        'Vendor Address': vendor_address,
        'Is Government': is_government ? 'true' : 'false',
      });
    }
  }, [vendorData]);

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  const onCancel = () => {
    hidePopup();
  };

  const onFinish = async () => {
    const editVendorData = formRef.current?.getFieldsValue();

    const data = {
      vendor_name: editVendorData['Vendor Name'],
      vendor_address: editVendorData['Vendor Address'],
      is_government: editVendorData['Is Government'] === 'true',
      vendor_owner_id: vendorData.editVendorData.vendor_owner_id
    };


    if(vendorData.editVendorData?.vendor_name === editVendorData['Vendor Name'] ){
      delete data.vendor_name;
    }

    const response = await vendorApi.updateVendor(
      data,
      vendorData.editVendorData?.vendor_id
    );

    if (response.success) {
      onEditVendorSuccess();
      hidePopup();
    } else {
      showError(response.message);
    }

    vendorData.setEditVendorData(editVendorData);
  };

  return (
    <Modal
      title="Edit Vendor"
      visible={isEditPopupVisible}
      onOk={onFinish}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      className={'edit-vendor-popup'}
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
