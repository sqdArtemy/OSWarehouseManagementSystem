import React, { useEffect } from 'react';
import './add-warehouse.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { userApi, warehouseApi } from '../../../../index';

import { useError } from '../../../error-component/error-context';
import { useLoading } from '../../../loading-component/loading';

export interface INewWarehouseData {
  'Warehouse Name'?: string;
  Capacity?: string;
  Address?: string;
  Type?: string;
  Supervisor?: string[];
}

// const options: Select['OptionType'][] = [
//   { value: 'manager', label: 'Manager' },
//   { value: 'vendor', label: 'Vendor' },
// ];

export default function AddWarehouse({
  isPopupVisible,
  hidePopup,
  warehouseData,
  onAddWarehouseSuccess,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  warehouseData: {
    warehouseData: INewWarehouseData;
    setWarehouseData: (userData: unknown) => void;
  };
  onAddWarehouseSuccess: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);
  const { startLoading, stopLoading } = useLoading();
  const { showError } = useError();
  const [options, setOptions] = React.useState<Select['OptionType'][]>([]);
  const [supervisor, setSupervisor] = React.useState<Select['ValueType']>({});

  useEffect(() => {
    if (isPopupVisible && warehouseData.warehouseData && formRef.current) {
      startLoading();
      userApi.getAllUsers({ user_role: 'supervisor' }).then((res) => {
        console.log('supervisors', res.data.body);

        setOptions(
          res.data.body.map((val) => {
            return {
              value: val.user_id,
              label: val.user_name + ' ' + val.user_surname,
            };
          }),
        );

        setSupervisor(formRef.current.getFieldsValue()['Supervisor']);

        stopLoading();
        if (!res.success) {
          showError(res.message);
        }
      });
    }
  }, [warehouseData]);

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 13, span: 17 },
  };

  function onTypeChange() {
    console.log('change');
  }

  const onCancel = () => {
    hidePopup();
    // handleReset();
  };

  const onFinish = async () => {
    formRef.current.setFieldsValue({
      Supervisor: supervisor,
    });
    const newWarehouseData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newWarehouseData) {
      if (newWarehouseData[key]) {
        check = true;
      }
    }
    if (!check) {
      hidePopup();
      handleReset();
    } else {
      hidePopup();
    }

    // await userApi.addUser({
    //   user_name: newUserData['First Name'],
    //   user_surname: newUserData['Last Name'],
    //   user_email: newUserData['Email'],
    //   user_phone: newUserData['Phone'],
    //   user_role: newUserData['Role'],
    // });

    startLoading();
    const response = await warehouseApi.addWarehouse({
      warehouse_address: newWarehouseData['Address'],
      warehouse_name: newWarehouseData['Warehouse Name'],
      overall_capacity: newWarehouseData['Capacity'],
      supervisor_id: newWarehouseData['Supervisor'].supervisor_id,
      warehouse_type: newWarehouseData['Type'],
    });

    if (response.success) {
      stopLoading();
      onAddWarehouseSuccess();
    } else {
      stopLoading();
      showError(response.message);
    }

    warehouseData.setWarehouseData(newWarehouseData);
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
        name="add-user"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="Warehouse Name"
          label={<p style={{ fontSize: '1vw' }}>Name</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Capacity"
          label={<p style={{ fontSize: '1vw' }}>Capacity</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Address"
          label={<p style={{ fontSize: '1vw' }}>Address</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Supervisor"
          label={<p style={{ fontSize: '1vw' }}>Supervisor</p>}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={'Select a Supervisor'}
            style={{ minHeight: '2vw' }}
            value={supervisor ? supervisor : undefined}
            onChange={(value, option) => {
              const supervisorObj = {
                supervisor_id: option?.value,
                fullName: option?.label,
              };
              setSupervisor(supervisorObj);
            }}
            options={options}
          ></Select>
        </Form.Item>
        <Form.Item
          name="Type"
          label={<p style={{ fontSize: '1vw' }}>Type</p>}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={'Select a Type'}
            onChange={onTypeChange}
            style={{ minHeight: '2vw' }}
          >
            <Select.Option value="freezer">Freezer</Select.Option>
            <Select.Option value="refrigerated">Refrigerator</Select.Option>
            <Select.Option value="dry">Dry</Select.Option>
            <Select.Option value="hazardous">Hazardous</Select.Option>
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
