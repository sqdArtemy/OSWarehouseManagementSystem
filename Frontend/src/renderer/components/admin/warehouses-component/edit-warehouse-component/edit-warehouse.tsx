import React, { useEffect } from 'react';
import './edit-warehouse.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { INewWarehouseData } from '../add-warehouse-component/add-warehouse';
import { IWarehouseData } from '../warehouses';
import { companyApi, userApi, warehouseApi } from '../../../../index';
import { useLoading } from '../../../loading-component/loading';
import { useError } from '../../../error-component/error-context';

export default function EditWarehouse({
  isPopupVisible,
  hidePopup,
  warehouseData,
  onEditSuccess,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  warehouseData: {
    warehouseData: INewWarehouseData | IWarehouseData;
    setWarehouseData: (warehouseData: unknown) => void;
  };
  onEditSuccess: () => void;
}) {
  console.log(warehouseData.warehouseData);
  const formRef = React.useRef<FormInstance>(null);
  const [companyOptions, setCompanyOptions] = React.useState<
    Select['OptionType'][]
  >([]);
  const { startLoading, stopLoading } = useLoading();
  const { showError } = useError();
  const [options, setOptions] = React.useState<Select['OptionType'][]>([]);
  const [supervisor, setSupervisor] = React.useState<Select['ValueType']>({});

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
    const newWarehouseData = formRef.current?.getFieldsValue();
    hidePopup();

    startLoading();
    const response = await warehouseApi.updateWarehouse(
      {
        warehouse_address: newWarehouseData['Address'],
        warehouse_name: newWarehouseData['Warehouse Name'],
        overall_capacity: Number(newWarehouseData['Capacity']),
        supervisor_id: supervisor.supervisor_id,
        warehouse_type: newWarehouseData['Type'],
      },
      Number(warehouseData.warehouseData.warehouse_id),
    );

    if (response.success) {
      stopLoading();
      onEditSuccess();
    } else {
      stopLoading();
      showError(response.message);
    }

    warehouseData.setWarehouseData(newWarehouseData);
  };

  useEffect(() => {
    if (isPopupVisible && warehouseData.warehouseData && formRef.current) {
      let { warehouseName, capacity, supervisor, type, address } =
        warehouseData.warehouseData;
      // const [firstName, lastName] = warehouseName.split(' ');

      if (String(capacity).includes('/')) {
        capacity = String(capacity).split('/')[1];
      }

      formRef.current.setFieldsValue({
        'Warehouse Name': warehouseName,
        Type: type,
        Supervisor: supervisor,
        Capacity: capacity,
        Address: address,
      });

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
      title={<p style={{ fontSize: '1.2vw' }}>Edit Warehouse</p>}
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
        name="edit-warehouse"
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
          <Select placeholder={'Select a Type'} style={{ minHeight: '2vw' }}>
            <Select.Option value="freezer">Freezer</Select.Option>
            <Select.Option value="refrigerated">Refrigerator</Select.Option>
            <Select.Option value="dry">Dry</Select.Option>
            <Select.Option value="hazardous">Hazardous</Select.Option>
          </Select>
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
