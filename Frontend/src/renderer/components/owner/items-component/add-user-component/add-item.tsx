import React from 'react';
import './add-item.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';

export interface IUserData {
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
  userData,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  userData: {
    newUserData: IUserData;
    setNewUserData: (newUserData: unknown) => void;
  };
}) {
  const formRef = React.useRef<FormInstance>(null);

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

  const onFinish = () => {
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
    userData.setNewUserData(newUserData);
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };
  // @ts-ignore
  // @ts-ignore
  return (
    <Modal
      title="Add New Item"
      open={isPopupVisible}
      onOk={onFinish}
      onCancel={onFinish}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
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
          name="Product Name"
          label="Product Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="Weight"
          label="Weight"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="Volume" label="Volume" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="Price" label="Price" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="Expiration" label="Expiration" rules={[{ required: true }]}>
          <Select
            placeholder="Select from following"
            onChange={onRoleChange}
            allowClear
          >
            <Option value="perishable-refrigerator">Perishable (Refrigerator used)</Option>
            <Option value="perishable-freezer">Perishable (Freezer used)</Option>
            <Option value="nonperishable">Nonperishable</Option>
            <Option value="hazard">Hazard</Option>
          </Select>
        </Form.Item>
        <Form.Item name="Storage type" label="Storage type" rules={[{ required: true }]}>
          <label>Stack-able <Input type="radio" name="storage-type" id="stack-able" value="stack-able"/></label>
          <label>Nonstack-able <Input type="radio" name="storage-type" id="nonStack-able" value="nonStack-able"/></label>
        </Form.Item>
        <Form.Item name="Description" label="Description" rules={[{ required: true }]}>
          <textarea placeholder="Write the description of item here" rows={4} cols={45}/>
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
