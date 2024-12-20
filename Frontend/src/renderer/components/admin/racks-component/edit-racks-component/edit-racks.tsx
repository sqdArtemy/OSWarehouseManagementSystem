import React, { useEffect } from 'react';
import './edit-racks.scss';
import { Button, Form, FormInstance, Input, Modal } from 'antd';
import { rackApi, userApi } from '../../../../index';
import { INewRacksData } from '../add-racks-component/add-racks';
import { IRacksData } from '../racks';
import { useError } from '../../../result-handler-component/error-component/error-context';

export default function EditRacks({
  isPopupVisible,
  hidePopup,
  racksData,
  onEditRackSuccess,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  racksData: {
    racksData: INewRacksData | IRacksData;
    setRacksData: (racksData: unknown) => void;
  };
  onEditRackSuccess: () => void;
}) {
  console.log(racksData.racksData);
  const formRef = React.useRef<FormInstance>(null);
  const { showError } = useError();

  useEffect(() => {
    if (isPopupVisible && racksData.racksData && formRef.current) {
      const { warehouse, rackPosition, overallCapacity } = racksData.racksData;

      formRef.current.setFieldsValue({
        warehouse: warehouse,
        rackPosition: rackPosition,
        overallCapacity: overallCapacity,
      });
    }
  }, [racksData]);

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
    const newRackData = formRef.current?.getFieldsValue();
    hidePopup();

    const response = await rackApi.updateRack(
      {
        rack_position: newRackData['rackPosition'],
        overall_capacity: Number(newRackData['overallCapacity']),
      },
      racksData.racksData?.rack_id,
    );

    if (response?.success) {
      onEditRackSuccess();
    } else {
      showError(response.message);
    }
    racksData.setRacksData(newRackData);
  };

  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Edit User</p>}
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
        name="edit-user"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="warehouse"
          label={<p style={{ fontSize: '1vw' }}>Warehouse Name</p>}
        >
          <Input disabled={true} style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="rackPosition"
          label={<p style={{ fontSize: '1vw' }}>Rack Position</p>}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="overallCapacity"
          label={
            <p style={{ fontSize: '1vw' }}>
              Overall Capacity (m<sup>3</sup>)
            </p>
          }
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
