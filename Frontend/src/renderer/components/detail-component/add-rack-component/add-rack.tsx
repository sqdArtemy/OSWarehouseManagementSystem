import React from 'react';
import { Button, Form, FormInstance, Input, Modal } from 'antd';

export default function AddRack({ isPopupVisible, hidePopup }) {
  const formRef = React.useRef<FormInstance>(null);

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

  const handleOk = (e) => {
    hidePopup();
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
