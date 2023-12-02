import React from 'react';
import './add-racks.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { userApi } from '../../../../index';

export interface INewRacksData {
  warehouse?: string;
  rackPosition?: string;
  overallCapacity?: string;
}

export default function AddRacks({
  isPopupVisible,
  hidePopup,
  racksData, onAddUserSuccess,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  racksData: {
    racksData: INewRacksData;
    setRacksData: (racksData: unknown) => void;
  };
  onAddUserSuccess: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);

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
    const newUserData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newUserData) {
      if (newUserData[key]) {
        check = true;
      }
    }
    if (!check) {
      hidePopup();
      handleReset();
    } else {
      hidePopup();
    }

    const response = await userApi.addUser({
      user_name: newUserData['First Name'],
      user_surname: newUserData['Last Name'],
      user_email: newUserData['Email'],
      user_phone: newUserData['Phone'],
      user_role: 'supervisor',
    });
    console.log(response);
    if(response.success){
      onAddUserSuccess();
    }
    racksData.setRacksData(newUserData);
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };
  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Add New Rack</p>}
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
        name="add-rack"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="warehouse"
          label={<p style={{ fontSize: '1vw' }}>Warehouse Name</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="rackPosition"
          label={<p style={{ fontSize: '1vw' }}>Rack Position</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="overallCapacity"
          label={<p style={{ fontSize: '1vw' }}>Overall Capacity</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
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
