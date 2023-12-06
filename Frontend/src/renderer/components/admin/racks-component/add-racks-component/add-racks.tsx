import React, { useEffect } from 'react';
import './add-racks.scss';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { rackApi, userApi, warehouseApi } from '../../../../index';

export interface INewRacksData {
  warehouse?: string;
  rackPosition?: string;
  overallCapacity?: string;
}

export default function AddRacks({
  isPopupVisible,
  hidePopup,
  racksData, onAddRackSuccess,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  racksData: {
    racksData: INewRacksData;
    setRacksData: (racksData: unknown) => void;
  };
  onAddRackSuccess: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);
  const [options, setOptions] = React.useState<Select['OptionType'][]>([]);
  const [warehouse, setWarehouse] = React.useState<Select['ValueType']>({});


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
    const newRackData = formRef.current?.getFieldsValue();

    const response = await rackApi.addRack({
      rack_position: newRackData['rackPosition'],
      overall_capacity: Number(newRackData['overallCapacity']),
      warehouse_id: newRackData['warehouse']
    })
    console.log(response);
    if(response.success){
      onAddRackSuccess();
    }
    hidePopup();
    racksData.setRacksData(newRackData);
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  useEffect(() => {
    if (isPopupVisible && racksData.racksData && formRef.current) {
      warehouseApi.getAllWarehouses({  }).then(async (res) => {
        setOptions(
          res.data.body.map((val) => {
            return {
              value: val.warehouse_id,
              label: val.warehouse_name,
            };
          }),
        );

        setWarehouse(formRef.current.getFieldsValue()['Supervisor']);
      })
    }
  })
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
          label={<p style={{ fontSize: '1vw' }}>Company</p>}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={'Select a warehouse'}
            style={{ minHeight: '2vw' }}
            options={options}
          />
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
