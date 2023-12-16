import React, { useEffect } from 'react';
import './edit-transport.scss';
import { Button, Form, FormInstance, InputNumber, Modal } from 'antd';
import { transportApi } from '../../../../index';
import { INewTransportData } from '../add-transport-component/add-transport';
import { ITransportData } from '../transport';
import { useError } from '../../../error-component/error-context';

export default function EditTransport({
  isPopupVisible,
  hidePopup,
  transportData,
  onEditSuccess,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  transportData: {
    transportData: INewTransportData | ITransportData;
    setTransportData: (transportData: unknown) => void;
  };
  onEditSuccess: () => void;
}) {
  console.log(transportData.transportData);
  const formRef = React.useRef<FormInstance>(null);
  const { showError } = useError();

  useEffect(() => {
    if (isPopupVisible && transportData.transportData && formRef.current) {
      const { transportID, capacity, maxSpeed, price_weight, type } =
        transportData.transportData;

      formRef.current.setFieldsValue({
        transportID: transportID,
        Type: type,
        maxSpeed: maxSpeed,
        Capacity: capacity,
        price_weight: price_weight,
      });
    }
  }, [isPopupVisible, transportData]);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 16, span: 17 },
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  const onCancel = () => {
    hidePopup();
    handleReset();
  };

  const onFinish = async () => {
    const newTransportData = formRef.current?.getFieldsValue();
    hidePopup();

    const response = await transportApi.editTransport(
      Number(transportData.transportData?.transportID),
      {
        transport_capacity: Number(newTransportData.Capacity),
        transport_speed: Number(newTransportData.maxSpeed),
        transport_type: newTransportData.Type,
        price_per_weight: Number(newTransportData.price_weight),
      },
    );

    if (response.success) {
      onEditSuccess();
    } else {
      showError(response.message);
    }

    transportData.setTransportData(newTransportData);
  };

  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Edit Transport</p>}
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
        name="edit-transport"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="Capacity"
          label={
            <p style={{ fontSize: '1vw' }}>
              Capacity m<sup>3</sup>
            </p>
          }
          rules={[
            { required: true },
            {
              type: 'number',
              min: 0,
              message: 'Value must be greater than or equal to 0',
            },
          ]}
        >
          <InputNumber style={{ fontSize: '0.9vw' }} min={0 as any} />
        </Form.Item>
        <Form.Item
          name="maxSpeed"
          label={<p style={{ fontSize: '1vw' }}>Max Speed</p>}
          rules={[
            { required: true },
            {
              type: 'number',
              min: 0,
              message: 'Value must be greater than or equal to 0',
            },
          ]}
        >
          <InputNumber style={{ fontSize: '0.9vw' }} min={0 as any} />
        </Form.Item>
        <Form.Item
          name="price_weight"
          label={<p style={{ fontSize: '1vw' }}>Price/weight ($/kg)</p>}
          rules={[
            { required: true },
            {
              type: 'number',
              min: 0,
              message: 'Value must be greater than or equal to 0',
            },
          ]}
        >
          <InputNumber
            style={{ fontSize: '0.9vw' }}
            min={0 as any}
            step="any"
          />
        </Form.Item>
        <Form.Item
          name="Type"
          label={<p style={{ fontSize: '1vw' }}>Type</p>}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ fontSize: '0.9vw' }} disabled min={0 as any} />
        </Form.Item>
        <Form.Item
          {...tailLayout}
          labelAlign={'right'}
          style={{ marginBottom: '1vw' }}
        >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
