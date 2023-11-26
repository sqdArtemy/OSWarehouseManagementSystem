// Updated AddOrder.tsx

import React, { useEffect, useState } from 'react';
import { Button, Form, FormInstance, Input, Modal, Select } from 'antd';
import { vendorApi, companyApi, orderApi, warehouseApi } from '../../../../index';
import { useError } from '../../../error-component/error-context';
import { useLoading } from '../../../loading-component/loading';

export default function AddOrder({
                                   isPopupVisible,
                                   hidePopup,
                                   onAddOrderSuccess,
                                 }: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  onAddOrderSuccess: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);
  const { startLoading, stopLoading } = useLoading();
  const { showError } = useError();
  const [vendors, setVendors] = useState<Select['OptionType'][]>([]);
  const [companies, setCompanies] = useState<Select['OptionType'][]>([]);
  const warehouses: Select['OptionType'][] = [
    { value: 'to_warehouse', label: 'To Warehouse' },
    { value: 'from_warehouse', label: 'From Warehouse' },
  ];

  useEffect(() => {
    if (isPopupVisible && formRef.current) {
      startLoading();

      // Fetch data for vendors and companies
      Promise.all([vendorApi.getAllVendors({}), companyApi.getAll()])
        .then(([vendorsResponse, companiesResponse]) => {
          const mapToOptions = (data) => {
            return data.map((item) => ({
              value: item.id,
              label: item.name,
            }));
          };

          setVendors(mapToOptions(vendorsResponse.data.body));
          setCompanies(mapToOptions(companiesResponse.data.body));

          stopLoading();
        })
        .catch((error) => {
          showError(error.message);
          stopLoading();
        });
    }
  }, [isPopupVisible]);

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 13, span: 17 },
  };

  const onCancel = () => {
    hidePopup();
  };

  const onFinish = async () => {
    const newOrderData = formRef.current?.getFieldsValue();

    const response = await warehouseApi.findSuitableWarehousesForOrders({
      order_type: newOrderData['Warehouse'],
      company_id: newOrderData['Company'],
      items: [],
    });

    if (response.success) {
      onAddOrderSuccess();
    } else {
      showError(response.message);
    }

    hidePopup();
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  return (
    <Modal
      title={<p style={{ fontSize: '1.2vw' }}>Add New Order</p>}
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
        name="add-order"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="Warehouse"
          label={<p style={{ fontSize: '1vw' }}>Select Warehouse</p>}
          rules={[{ required: true }]}
        >
          <Select options={warehouses} style={{ minHeight: '2vw' }} />
        </Form.Item>
        <Form.Item
          name="Vendor"
          label={<p style={{ fontSize: '1vw' }}>Select Vendor</p>}
          rules={[{ required: true }]}
        >
          <Select options={vendors} style={{ minHeight: '2vw' }} />
        </Form.Item>
        <Form.Item
          name="Company"
          label={<p style={{ fontSize: '1vw' }}>Select Company</p>}
          rules={[{ required: true }]}
        >
          <Select options={companies} style={{ minHeight: '2vw' }} />
        </Form.Item>
        {/* Add other order-related form fields */}
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
