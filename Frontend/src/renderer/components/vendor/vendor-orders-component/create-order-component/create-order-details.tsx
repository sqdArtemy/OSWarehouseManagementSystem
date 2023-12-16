import React, { useEffect, useState } from 'react';
import './create-order-details.scss'; // Add your stylesheet if needed
import { Table, Button, Select, Modal } from 'antd';
import { orderApi, vendorApi } from '../../../../index';
import { IAddOrder } from '../../../../services/interfaces/ordersInterface';
import { useNavigate } from 'react-router-dom';
import { useError } from '../../../error-component/error-context';

export default function CreateOrderDetails({ orderDetails, hidePopup }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const navigate = useNavigate();
  const { showError } = useError();

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'Warehouse Name',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
    },
    {
      title: 'Warehouse Address',
      dataIndex: 'warehouse_address',
      key: 'warehouse_address',
    },
  ];

  const data = orderDetails?.warehouses?.map((order) => ({
    key: order.warehouse_id.toString(),
    company_name: order.company.company_name,
    warehouse_name: order.warehouse_name,
    warehouse_address: order.warehouse_address,
  }));

  useEffect(() => {
    // Set totalPrice when orderDetails.totalPrice changes
    if (orderDetails.totalPrice) {
      setTotalPrice(orderDetails.totalPrice);
    }
    checkVendorType();
  }, [orderDetails.totalPrice]);

  const handleSendOrder = async () => {
    if (selectedWarehouse) {
      const { order_type, vendor_id, items } = orderDetails.orderDetails || {};

      if (
        order_type !== undefined &&
        vendor_id !== undefined &&
        items !== undefined
      ) {
        const orderData: any = {
          warehouse_id: Number(selectedWarehouse),
          vendor_id,
          items,
          order_type,
        };

        const response = await orderApi.addOrder(orderData);
        if (response.success) {
          hidePopup();
          navigate('/vendor/orders');
        } else {
          showError(response.message);
        }
      }
    }
  };

  const checkVendorType = async () => {
    const response = await vendorApi.getVendor(
      orderDetails.orderDetails.vendor_id,
    );
    if (response.success) {
      if (response.data.body.is_government) {
        setTotalPrice(0);
      }
    }
  };

  const handleGoBack = () => {
    // Implement logic to go back
    console.log('Going back');
    // Close the modal or perform any other necessary action
    hidePopup();
  };

  return (
    <div className="create-order-details-container">
      <Select
        className="choose-warehouse-select"
        placeholder="Choose Warehouse"
        onChange={setSelectedWarehouse}
      >
        {data.map((warehouse) => (
          <Select.Option key={warehouse.key} value={warehouse.key}>
            {warehouse.warehouse_name}
          </Select.Option>
        ))}
      </Select>

      {data.length > 0 ? (
        <>
          <div className="total-price">
            Total price for this order is {totalPrice}$
          </div>
          <div className="table-container">
            <Table
              dataSource={data}
              columns={columns}
              pagination={false}
              size="small"
              bordered
              rowClassName="highlight-bottom-border highlight-left-border"
            />
          </div>

          <div className="button-container">
            <Button type="primary" onClick={handleSendOrder}>
              Send Order
            </Button>
            <Button onClick={handleGoBack}>Go Back</Button>
          </div>
        </>
      ) : (
        <p>No warehouses are suitable for the current order.</p>
      )}
    </div>
  );
}
