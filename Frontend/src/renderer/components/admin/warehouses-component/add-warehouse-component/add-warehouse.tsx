import React, { useEffect } from 'react';
import './add-warehouse.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { companyApi, userApi, warehouseApi } from '../../../../index';
import { useLoading } from '../../../loading-component/loading';
import { useError } from '../../../result-handler-component/error-component/error-context';

export interface INewWarehouseData {
  'Warehouse Name'?: string;
  Capacity?: string;
  Address?: string;
  Type?: string;
  Supervisor?: string;
}

export default function AdminAddWarehouse({
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
  const [companyOptions, setCompanyOptions] = React.useState<
    Select['OptionType'][]
  >([]);
  const { startLoading, stopLoading } = useLoading();
  const { showError } = useError();
  const [options, setOptions] = React.useState<Select['OptionType'][]>([]);
  const [supervisor, setSupervisor] = React.useState<Select['ValueType']>({});

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

    startLoading();
    console.log(newWarehouseData);
    const response = await warehouseApi.addWarehouse({
      warehouse_address: newWarehouseData['Address'],
      warehouse_name: newWarehouseData['Warehouse Name'],
      overall_capacity: newWarehouseData['Capacity'],
      supervisor_id: newWarehouseData['Supervisor'],
      warehouse_type: newWarehouseData['Type'],
      company_id: newWarehouseData['Company'],
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

  useEffect(() => {
    if (isPopupVisible && warehouseData.warehouseData && formRef.current) {
      startLoading();
      userApi.getAllUsers({ user_role: 'supervisor' }).then(async (res) => {
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

        const response = await companyApi.getAll();
        const companies = response.data.body;
        setCompanyOptions(
          companies.map((company) => {
            return {
              value: company.company_id,
              label: company.company_name,
            };
          }),
        );
        stopLoading();
        if (!res.success) {
          showError(res.message);
        }
      });
    }
  }, [warehouseData]);

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
        name="add-warehouse"
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
          name="Warehouse Name"
          label={<p style={{ fontSize: '1vw' }}>Warehouse Name</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Form.Item
          name="Capacity"
          label={
            <p style={{ fontSize: '1vw' }}>
              Capacity m<sup>3</sup>
            </p>
          }
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
            onChange={onRoleChange}
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
