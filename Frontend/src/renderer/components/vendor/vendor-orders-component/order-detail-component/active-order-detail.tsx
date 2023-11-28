import React, { useEffect, useState } from 'react';
import { Modal, Form, Table, Button } from 'antd';
import { orderApi, productApi, vendorApi } from '../../../../index';
import './active-order-detail.scss';
import { useNavigate } from 'react-router-dom';
import { useError } from '../../../error-component/error-context';

interface OrderActiveDetailsProps {
  id: string;
  onClose: () => void;
  isActiveOrderVisible: boolean;
}

const OrderActiveDetails: React.FC<OrderActiveDetailsProps> = ({ id, onClose, isActiveOrderVisible, onCancelSuccess }) => {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const navigate = useNavigate();
  const { showError } = useError();


  useEffect(() => {
    orderApi.getOrder(Number(id)).then(async (data) => {
      const productsResponse = await productApi.getAllProducts({});
      const products = productsResponse.data?.body;

      const items = data.data?.body?.items;
      const orderDetails = data.data?.body;
      const orderItems = [];


      for (let item of items){
        const product = products?.find(product => { return product.product_id == item.product});

        if(product) {
          orderItems.push({
            product_name: product?.product_name,
            quantity: item.quantity
          })
        }
      }

      const vendor = orderDetails.order_type === 'to_warehouse' ?
        orderDetails.supplier : orderDetails.recipient;

      const warehouse = orderDetails.order_type === 'from_warehouse'
        ? orderDetails.supplier : orderDetails.recipient;

      orderDetails.items = orderItems;
      orderDetails.vendor = vendor;
      orderDetails.warehouse = warehouse;
      setOrderDetails(data.data?.body);
    });
  }, [id]);

  const columns = [
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
  ];

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const handleEditOrder = () => {
    console.log('Edit Order clicked');
  };

  const handleCancelOrder = async () => {
    const response = await orderApi.cancelOrder(Number(id));
    if(response.success){
      onCancelSuccess();
      onClose();
    }
    else {
      showError(response?.message);
    }
  };

  return (
    <Modal
      title="Order Active Details"
      visible={isActiveOrderVisible}
      onCancel={onClose}
      footer={null} // Remove the default footer
    >
      <Form {...layout} initialValues={orderDetails} colon={false}>
        <Form.Item label="Created At" name="created_at">
          <span className="form-value">{orderDetails?.created_at}</span>
        </Form.Item>
        <Form.Item label="Destination" name="order_type">
          <span className="form-value">{String(orderDetails?.order_type).replace(/_/g, ' ')}</span>
        </Form.Item>
        <Form.Item label="Vendor Name" name="vendor">
          <span className="form-value">{orderDetails?.vendor}</span>
        </Form.Item>
        <Form.Item label="Warehouse Name" name="vendor">
          <span className="form-value">{orderDetails?.vendor}</span>
        </Form.Item>
        <Form.Item label="Order Status" name="order_status">
          <span className="form-value">{orderDetails?.order_status}</span>
        </Form.Item>
        <Form.Item label="Total Price" name="total_price">
          <span className="form-value">{orderDetails?.total_price}</span>
        </Form.Item>
        <Form.Item label="Total Volume" name="total_volume">
          <span className="form-value">{orderDetails?.total_volume}</span>
        </Form.Item>
      </Form>

        <Table pagination={false} dataSource={orderDetails?.items} columns={columns} />

        {/* Buttons at the bottom */}
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
            {orderDetails?.order_status === 'new' && (
              <>
                <Button type="primary" onClick={handleEditOrder}>
                  Edit Order
                </Button>
                <Button danger onClick={handleCancelOrder} style={{ marginLeft: '8px' }}>
                  Cancel Order
                </Button>
              </>
            )}
          <Button onClick={onClose} style={{ marginLeft: '8px' }}>
            Close
          </Button>
        </div>
    </Modal>
  );
};

export default OrderActiveDetails;
