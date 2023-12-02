import React from 'react';
import { Button, Form, FormInstance, Input, Modal } from 'antd';
import { rackApi, warehouseApi } from '../../../index';
import { normalizeRacksForGrid } from '../../../services/utils/normalizeRacksForGrid';
import { useError } from '../../error-component/error-context';
import { useLoading } from '../../loading-component/loading';

export default function AddRack({ isPopupVisible, hidePopup, updateGridData }) {
  const formRef = React.useRef<FormInstance>(null);
  const { showError } = useError();
  const { startLoading, stopLoading } = useLoading();

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  const layout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 15 },
  };

  const tailLayout = {
    wrapperCol: { offset: 10, span: 15 },
  };

  const handleCancel = (e) => {
    hidePopup();
  };

  const handleOk = async (e) => {
    startLoading();
    const response = await rackApi.addRack({
      warehouse_id: 6,
      rack_position: formRef.current?.getFieldsValue()['Rack Position'],
      overall_capacity: Number(formRef.current?.getFieldsValue()['Capacity']),
    });
    stopLoading();
    console.log(response);
    if (response.success) {
      console.log('success');
      hidePopup();
      warehouseApi.getWarehouse(Number('6')).then((data) => {
        if (data.success && data.data?.data) {
          updateGridData(normalizeRacksForGrid(data.data.data.racks));
        }
      });
    } else {
      showError(response.data.message);
    }
  };

  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Add Rack</p>}
      open={isPopupVisible}
      onCancel={(event) => handleCancel(event)}
      okText={'Submit'}
      onOk={(event) => handleOk(event)}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      width={'30vw'}
    >
      <Form
        {...layout}
        labelAlign={'left'}
        name="add-rack"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        ref={formRef}
        onFinish={handleOk}
      >
        <Form.Item
          name="Rack Position"
          label={<p style={{ fontSize: '1vw' }}>Rack Position:</p>}
          rules={[{ required: true, whitespace: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Capacity"
          label={<p style={{ fontSize: '1vw' }}>Capacity:</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            htmlType="button"
            onClick={handleReset}
            style={{
              marginRight: '1vw',
              fontSize: '1vw',
              width: '5vw',
              height: '2.5vw',
            }}
          >
            Reset
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            style={{
              fontSize: '1vw',
              width: '5.5vw',
              height: '2.5vw',
            }}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
