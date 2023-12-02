import React from 'react';
import { Button, Form, FormInstance, Input, Modal } from 'antd';

// pop-up component: inputs are: rack position, capacity
export default function AddMultipleRacks({ isPopupVisible, hidePopup }) {
  const formRef = React.useRef<FormInstance>(null);

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  const layout = {
    labelCol: { span: 13 },
    wrapperCol: { span: 15 },
  };

  const tailLayout = {
    wrapperCol: { offset: 13, span: 15 },
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
      width={'35vw'}
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
          name="Number of Rows"
          label={<p style={{ fontSize: '1vw' }}>Number of Rows:</p>}
          rules={[{ required: true, whitespace: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Number of Columns"
          label={<p style={{ fontSize: '1vw' }}>Number of Columns:</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Total Capacity"
          label={<p style={{ fontSize: '1vw' }}>Total Capacity:</p>}
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
