import React, { useEffect, useState } from 'react';
import { Modal, Form, Table, Button, InputNumber, Space } from 'antd';
import { orderApi, productApi } from '../../../../index';
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
  const [editMode, setEditMode] = useState(false);
  const { showError } = useError();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCancelConfirmationModal, setShowCancelConfirmationModal] = useState(false);

  useEffect(() => {
    orderApi.getOrder(Number(id)).then(async (data) => {
      console.log(data.data?.body);
      const productsResponse = await productApi.getAllProducts({});
      const products = productsResponse.data?.body;

      const items = data.data?.body?.items;
      const orderDetails = data.data?.body;
      const orderItems = [];

      if(items) {
        for (let item of items) {
          const product = products?.find((product) => {
            return product.product_id == item.product;
          });

          if (product) {
            orderItems.push({
              product_name: product?.product_name,
              product_id: item.product,
              quantity: item.quantity,
            });
          }
        }
      }

      const vendor = orderDetails.order_type === 'to_warehouse' ? orderDetails.supplier : orderDetails.recipient;
      const warehouse =
        orderDetails.order_type === 'from_warehouse' ? orderDetails.supplier : orderDetails.recipient;

      orderDetails.items = orderItems ?? [];
      orderDetails.vendor = vendor?.vendor_name;
      orderDetails.vendor_id = vendor?.vendor_id;
      orderDetails.warehouse = warehouse?.warehouse_name;
      setOrderDetails(data.data?.body);
    });
  }, [id]);

  const columns = [
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => {
        return editMode ? (
          <InputNumber
            value={text}
            onChange={(value) => handleQuantityChange(record.product_name, value)}
          />
        ) : (
          text
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          {editMode && (
            <Button type="link" onClick={() => handleRemoveItem(record.product_name)}>
              Remove
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const handleEditOrder = () => {
    setEditMode(true);
    console.log('Edit Order clicked');
  };

  const handleUpdateOrder = async () => {
    const items = [];
    for (let item of orderDetails.items){
      items.push({
        product_id: item.product_id,
        quantity: item.quantity
      })
    }

    const response = await orderApi.updateOrder({ items, vendor_id: orderDetails.vendor_id }, Number(id));
    if (response.success) {
      onCancelSuccess();
      onClose();
    } else {
      showError(response?.message);
    }
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleRemoveItem = (productName) => {
    setOrderDetails((prevOrderDetails) => {
      const updatedItems = prevOrderDetails.items.filter((item) => item.product_name !== productName);

      return {
        ...prevOrderDetails,
        items: updatedItems,
      };
    });
  };

  const handleCancelOrder = async () => {
    setShowCancelConfirmationModal(true);
  };

  const handleConfirmCancelOrder = async () => {
    setShowCancelConfirmationModal(false)
    const response = await orderApi.cancelOrder(Number(id));
    if (response.success) {
      onCancelSuccess();
      onClose();
    } else {
      showError(response.message);
    }
  };

  const handleQuantityChange = (productName, value) => {
    setOrderDetails((prevOrderDetails) => {
      const updatedItems = prevOrderDetails.items.map((item) =>
        item.product_name === productName ? { ...item, quantity: value } : item
      );

      return {
        ...prevOrderDetails,
        items: updatedItems,
      };
    });
  };

  const handleConfirmDelivery = async () => {
    const response = await orderApi.changeStatusOfOrder(Number(id), 'finished');
    if(response.success) {
      setShowConfirmationModal(false);
    } else {
      showError(response.message)
    }
  };
  return (
    <Modal
      title={`Order Active Details ${editMode ? '(Editing)' : ''}`}
      visible={isActiveOrderVisible}
      onCancel={onClose}
      footer={null}
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
        <Form.Item label="Warehouse Name" name="warehouse">
          <span className="form-value">{orderDetails?.warehouse}</span>
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

      {editMode && (
        <>
        <Button type="primary" onClick={handleUpdateOrder} style={{ marginTop: '16px' }}>
          Update Order
        </Button>
        < Button onClick={handleCancelEdit} style={{marginLeft: '8px'}}>
        Cancel update
        </Button>
        </>
      )}

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        {orderDetails?.order_status === 'new' && !editMode && (
          <>
            <Button type="primary" onClick={handleEditOrder}>
              Edit Order
            </Button>
            <Button danger onClick={handleCancelOrder} style={{ marginLeft: '8px' }}>
              Cancel Order
            </Button>
          </>
        )}
        {orderDetails?.order_status === 'processing' && orderDetails?.order_type === 'from_warehouse' && (
          <>
            <span style={{ marginRight: '8px', color: 'red' }}>Confirm order when it's delivered.</span>
            <Button type="primary" onClick={() => setShowConfirmationModal(true)}>
              Confirm Delivery
            </Button>
          </>
        )}
        {!editMode && (
          < Button onClick={onClose} style={{marginLeft: '8px'}}>
          Close
          </Button>)
        }
      </div>
      <Modal
        title="Confirm Delivery"
        visible={showConfirmationModal}
        onOk={handleConfirmDelivery}
        onCancel={() => setShowConfirmationModal(false)}
      >
        <p>Are you sure you want to confirm delivery?</p>
      </Modal>

      <Modal
        title="Confirm Cancel Order"
        visible={showCancelConfirmationModal}
        onOk={handleConfirmCancelOrder}
        onCancel={() => setShowCancelConfirmationModal(false)}
      >
        <p>Are you sure you want to cancel this order?</p>
      </Modal>
    </Modal>
  );
};

export default OrderActiveDetails;
