import React, { useEffect, useState } from 'react';
import './add-user.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { companyApi, userApi } from '../../../../index';

export interface INewUserData {
  'First Name'?: string;
  'Last Name'?: string;
  Email?: string;
  Phone?: string;
  Role?: string;
}

export default function AddUser({
                                  isPopupVisible,
                                  hidePopup,
                                  userData,
                                  onAddUserSuccess,
                                }: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  userData: {
    userData: INewUserData;
    setUserData: (userData: unknown) => void;
  };
  onAddUserSuccess: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);
  const [companyOptions, setCompanyOptions] = React.useState<Select['OptionType'][]>([]);

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 13, span: 17 },
  };

  const roleOptions: any = [
    { value: 'vendor', label: 'Vendor' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Admin' },
  ];

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
      user_role: newUserData['Role'],
    });

    console.log(response);

    if (response.success) {
      onAddUserSuccess();
    }

    userData.setUserData(newUserData);
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  useEffect(() => {
    if (isPopupVisible && formRef.current) {
      companyApi.getAll().then((res) => {
        const companies = res.data.body;

        setCompanyOptions(
          companies.map((company) => {
            return {
              value: company.company_id,
              label: company.company_name,
            };
          }),
        );
      });
    }
  }, [isPopupVisible]);

  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Add New User</p>}
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
        name="add-user"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="Company"
          label={<p style={{ fontSize: '1vw' }}>Company</p>}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={'Select a Company'}
            style={{ minHeight: '2vw' }}
            options={companyOptions}
          />
        </Form.Item>
        <Form.Item
          name="First Name"
          label={<p style={{ fontSize: '1vw' }}>First Name</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Last Name"
          label={<p style={{ fontSize: '1vw' }}>Last Name</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Role"
          label={<p style={{ fontSize: '1vw' }}>Role</p>}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={'Select a Role'}
            style={{ minHeight: '2vw' }}
            options={roleOptions}
          />
        </Form.Item>
        <Form.Item
          name="Email"
          label={<p style={{ fontSize: '1vw' }}>Email</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Phone"
          label={<p style={{ fontSize: '1vw' }}>Phone</p>}
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
