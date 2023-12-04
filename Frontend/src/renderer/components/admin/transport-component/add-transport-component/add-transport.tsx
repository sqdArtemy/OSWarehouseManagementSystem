import React from 'react';
import './add-transport.scss';
import { Button, Form, FormInstance, Input, InputNumber, Modal, Select } from 'antd';
import { transportApi, userApi } from '../../../../index';
import { useError } from '../../../error-component/error-context';

export interface INewTransportData {
  TransportID?: string;
  Capacity?: string;
  'Max Speed'?: number;
  Type?: string;
  Price_weight?: number;
}

export default function AdminAddTransport({
                                            isPopupVisible,
                                            hidePopup,
                                            warehouseData,
                                            onAddSuccess
                                          }: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  warehouseData: {
    transportData: INewTransportData;
    setTransportData: (userData: unknown) => void;
  };
  onAddSuccess: () => void
}) {
  const formRef = React.useRef<FormInstance>(null);
  const { showError } = useError();

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 13, span: 17 },
  };

  function onRoleChange() {
    console.log('change');
  }

  const onCancel = () => {
    hidePopup();
    handleReset();
  };

  const onFinish = async () => {
    const newTransportData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newTransportData) {
      if (newTransportData[key] !== undefined && newTransportData[key] !== null) {
        check = true;
      }
    }

    const response = await transportApi.addTransport({
      transport_capacity: Number(newTransportData.Capacity),
      transport_speed: Number(newTransportData['Max Speed']),
      transport_type: newTransportData.Type,
      price_per_weight: Number(newTransportData['Price_weight'])
    });

    if(response.success){
      onAddSuccess();
    }
    else {
      showError(response.message)
    }
    warehouseData.setTransportData(newTransportData);

    if (!check) {
      hidePopup();
      handleReset();
    } else {
      hidePopup();
    }
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Add New Warehouse</p>}
      width={'30vw'}
      open={isPopupVisible}
      onOk={onFinish}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Form
        {...layout}
        labelAlign={'left'}
        ref={formRef}
        name="add-transport"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="Capacity"
          label={<p style={{ fontSize: '1vw' }}>Capacity</p>}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ fontSize: '0.9vw' }} min={0} />
        </Form.Item>
        <Form.Item
          name="Max Speed"
          label={<p style={{ fontSize: '1vw' }}>Max Speed</p>}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ fontSize: '0.9vw' }} min={0} />
        </Form.Item>
        <Form.Item
          name="Price_weight"
          label={<p style={{ fontSize: '1vw' }}>Price/weight</p>}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ fontSize: '0.9vw' }} min={0} />
        </Form.Item>
        <Form.Item
          name="Type"
          label={<p style={{ fontSize: '1vw' }}>Type</p>}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={'Select a Type'}
            onChange={onRoleChange}
            style={{ minHeight: '2vw' }}
          >
            <Select.Option value="truck">Truck</Select.Option>
            <Select.Option value="van">Van</Select.Option>
            <Select.Option value="car">Car</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          {...tailLayout}
          labelAlign={'right'}
          style={{ marginBottom: '1vw' }}
        >
          <Button
            htmlType="button"
            onClick={handleReset}
            style={{ marginRight: '1.3vw' }}
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