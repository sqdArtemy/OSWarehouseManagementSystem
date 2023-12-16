import React, { useEffect } from 'react';
import { Button, Form, FormInstance, Input, Modal } from 'antd';
import { rackApi, warehouseApi } from '../../../index';
import { normalizeRacksForGrid } from '../../../services/utils/normalizeRacksForGrid';
import { useError } from '../../error-component/error-context';
import { useLoading } from '../../loading-component/loading';
import { useParams } from 'react-router-dom';

export default function EditRack({
  isPopupVisible,
  hidePopup,
  rackData,
  updateGridData,
}) {
  const { warehouse_id } = useParams();
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
    const response = await rackApi.updateRack(
      {
        warehouse_id: Number(warehouse_id),
        rack_position: formRef.current?.getFieldsValue()['Rack Position'],
        overall_capacity: Number(formRef.current?.getFieldsValue()['Capacity']),
      },
      rackData.rackData.rack_id,
    );

    stopLoading();
    console.log(response);
    if (response.success) {
      console.log('success');
      hidePopup();
    } else {
      showError(response.message);
    }

    warehouseApi.getWarehouse(Number(warehouse_id)).then((data) => {
      if (data.success && data.data?.data) {
        updateGridData(normalizeRacksForGrid(data.data.data.racks));
      }
    });
  };

  useEffect(() => {
    if (isPopupVisible && rackData.rackData && formRef.current) {
      rackApi.getRack(rackData.rackData.rack_id).then((data) => {
        if (data.success) {
          formRef.current.setFieldsValue({
            'Rack Position': data.data.body.rack_position,
            Capacity: data.data.body.overall_capacity,
          });
        }
      });
    }
  }, [rackData]);

  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Update Rack</p>}
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
          label={
            <p style={{ fontSize: '1vw' }}>
              Capacity m<sup>3</sup>:
            </p>
          }
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
