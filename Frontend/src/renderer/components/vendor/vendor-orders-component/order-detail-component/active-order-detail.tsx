import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Table } from 'antd';
import { orderApi } from '../../../../index';

const ActiveOrderDetail = () => {
  const { order_id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const response = await orderApi.getOrder(Number(order_id));
      if (response.success) {
        setOrderDetails(response.data.body);
      } else {
        console.error(response.message);
      }
    };

    fetchOrderDetails();
  }, [order_id]);

  const columns = [
    {
      title: 'Product ID',
      dataIndex: 'product_id',
      key: 'product_id',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
  ];

  const dataSource = orderDetails?.items || [];

  return (
    <div>
      {orderDetails && (
        <>
          <h2>Order Details</h2>
          <p>Created At: {orderDetails.created_at}</p>
          <p>Vendor: {orderDetails.vendor}</p>
          <p>Order Status: {orderDetails.order_status}</p>

          {orderDetails.order_status === 'new' && (
            <Button type="danger" onClick={() => handleCancelOrder(order_id)}>
              Cancel Order
            </Button>
          )}

          <h3>Product Details</h3>
          <p>Total Price: {orderDetails.total_price}</p>
          <p>Total Volume: {orderDetails.total_volume}</p>

          <Table dataSource={dataSource} columns={columns} pagination={false} />

          {/* Add any other information or components as needed */}
        </>
      )}
    </div>
  );
};

const handleCancelOrder = async (orderId) => {
  try {
    const response = await orderApi.cancelOrder(orderId);
    if (response.success) {
      // Handle successful cancellation
      console.log('Order canceled successfully');
    } else {
      // Handle cancellation failure
      console.error(response.message);
    }
  } catch (error) {
    // Handle error
    console.error(error);
  }
};

export default ActiveOrderDetail;
