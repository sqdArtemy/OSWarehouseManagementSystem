import React, { useEffect, useState } from 'react';
import { Modal, Form, Table, Button, InputNumber, Space } from 'antd';
import { orderApi, productApi, transportApi, userApi } from '../../../index';
import './active-order-detail.scss';
import { useNavigate } from 'react-router-dom';
import { useError } from '../../result-handler-component/error-component/error-context';
import ChooseTransport from '../../owner/confirm-order-component/choose-transport-component/choose-transport';
import Accept from '../../supervisor/requests-component/accept-component/accept';
import { IOrderData } from '../../supervisor/requests-component/requests';
import { getLostItems } from '../../supervisor/requests-component/util';

interface OrderActiveDetailsProps {
  id: string;
  onClose: () => void;
  isActiveOrderVisible: boolean;
}

const convertToIOrderData = (orderItem: any): IOrderData => {
  return {
    orderStatus: orderItem.order_status,
    orderType: orderItem.order_type,
    createdAt: orderItem.created_at,
    orderId: orderItem.order_id,
    vendor: orderItem.vendor?.vendor_name || '', // Provide a default value if vendor is undefined
    vendorId: orderItem.vendor?.vendor_id || 0, // Provide a default value if vendor_id is undefined
    warehouse: orderItem.warehouse?.warehouse_name || '', // Provide a default value if warehouse is undefined
    warehouseId: orderItem.warehouse?.warehouse_id || 0, // Provide a default value if warehouse_id is undefined
    items: orderItem.items,
  };
};

const OrderActiveDetails: React.FC<OrderActiveDetailsProps> = ({
  id,
  onClose,
  isActiveOrderVisible,
  onCancelSuccess,
}) => {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const { showError } = useError();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCancelConfirmationModal, setShowCancelConfirmationModal] =
    useState(false);
  const [showTransportConfirmationModal, setShowTransportConfirmationModal] =
    useState(false);
  const navigate = useNavigate();
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [lostItemsDataSource, setLostItemsDataSource] = useState([]);

  useEffect(() => {
    if (isActiveOrderVisible && id) {
      orderApi.getOrder(Number(id)).then(async (data) => {
        if (data.success) {
          const productsResponse = await productApi.getAllProducts({});
          const products = productsResponse.data?.body;

          const processItems = (itemsList, productsList) => {
            const processedItems = [];

            for (let item of itemsList) {
              const product = productsList?.find(
                (product) => product.product_id == item.product,
              );

              if (product) {
                processedItems.push({
                  product_name: product?.product_name,
                  product_id: item.product,
                  quantity: item.quantity,
                });
              }
            }

            return processedItems;
          };

          const orderDetails = data.data?.body;
          const orderItems = processItems(data.data?.body?.items, products);
          const orderLostItems = processItems(
            data.data?.body?.lost_items,
            products,
          );

          const vendor =
            orderDetails.order_type === 'to_warehouse'
              ? orderDetails.supplier
              : orderDetails.recipient;
          const warehouse =
            orderDetails.order_type === 'from_warehouse'
              ? orderDetails.supplier
              : orderDetails.recipient;

          orderDetails.items = orderItems ?? [];
          orderDetails.lost_items = orderLostItems ?? [];
          orderDetails.vendor = vendor?.vendor_name;
          orderDetails.vendor_id = vendor?.vendor_id;
          orderDetails.warehouse = warehouse?.warehouse_name;

          setOrderDetails(data.data?.body);
          setLostItemsDataSource(
            orderLostItems.map((item) => {
              return {
                name: item.product_name,
                amount: item.quantity,
              };
            }),
          );
        } else {
          showError(data.message);
        }
      });
    }
  }, [id, showError]);

  useEffect(() => {
    const calculateScrollSize = () => {
      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
      );
      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0,
      );

      setScrollSize({
        x: vw * 0.1,
        y: vh * 0.4,
      });
    };
    calculateScrollSize();
    window.addEventListener('resize', calculateScrollSize);

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  useEffect(() => {
    // const fetchData = async () => {
    //   const lostItemsResponse = await getLostItems(orderData);
    //   setLostItemsDataSource(lostItemsResponse);
    // };
    // fetchData();
  }, [isActiveOrderVisible]);

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
            onChange={(value) =>
              handleQuantityChange(record.product_name, value)
            }
          />
        ) : (
          text
        );
      },
    },
  ];

  if (editMode) {
    columns.push({
      dataIndex: 'product_name',
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => handleRemoveItem(record.product_name)}
          >
            Remove
          </Button>
        </Space>
      ),
    });
  }

  const layout = { labelCol: { span: 12 }, wrapperCol: { span: 16 } };

  const hidePopup = () => {
    setShowTransportConfirmationModal(false);
  };

  const hideDeliveryPopup = () => {
    setShowConfirmationModal(false);
  };

  const handleEditOrder = () => {
    setEditMode(true);
    console.log('Edit Order clicked');
  };

  const handleUpdateOrder = async () => {
    const items = [];
    for (let item of orderDetails.items) {
      items.push({
        product_id: item.product_id,
        quantity: item.quantity,
      });
    }

    const response = await orderApi.updateOrder(
      { items, vendor_id: orderDetails.vendor_id },
      Number(id),
    );
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
      const updatedItems = prevOrderDetails.items.filter(
        (item) => item.product_name !== productName,
      );

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
    setShowCancelConfirmationModal(false);
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
        item.product_name === productName ? { ...item, quantity: value } : item,
      );

      return {
        ...prevOrderDetails,
        items: updatedItems,
      };
    });
  };

  const userRole = userApi.getUserData.user_role;

  const handleConfirmOrder = async () => {
    const volume = orderDetails ? orderDetails.total_volume : 0;
    const transports = await transportApi.getAllTransports({
      transport_capacity_gte: volume,
    });
    if (transports.length === 0) {
      showError(
        'No transport available. Ask the system administrator to add more transport.',
      );
      return;
    }
    setShowTransportConfirmationModal(true);
  };

  const handleRejectOrder = async () => {
    setShowCancelConfirmationModal(true);
  };

  const handleSuccessConfirm = async () => {
    onCancelSuccess();
    onClose();
  };

  const handleSuccessDeliver = async () => {
    setShowConfirmationModal(false);
    navigate('/vendor');
    setTimeout(() => {
      navigate('/vendor/orders');
    }, 100);
  };

  const lostItemsColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
    },
  ];

  const placeholderRowCount = 11;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      name: '',
      amount: '',
    }),
  );

  let lostItemsTableData =
    lostItemsDataSource.length > 0 ? lostItemsDataSource : placeholderData;
  if (lostItemsTableData.length < placeholderRowCount) {
    lostItemsTableData = [
      ...lostItemsTableData,
      ...placeholderData.slice(lostItemsTableData.length + 1),
    ];
  }

  return (
    <Modal
      title={
        <p style={{ fontSize: '1.3vw' }}>{`Order Active Details ${
          editMode ? '(Editing)' : ''
        }`}</p>
      }
      open={isActiveOrderVisible}
      onCancel={onClose}
      footer={null}
      centered={true}
      width={'65vw'}
    >
      <div className={'active-order-upper-container'}>
        <Form
          {...layout}
          labelAlign={'left'}
          initialValues={orderDetails}
          colon={false}
        >
          <Form.Item
            label={<p style={{ fontSize: '1vw', margin: 0 }}>Created At</p>}
            name="created_at"
          >
            <span className="form-value">{orderDetails?.created_at}</span>
          </Form.Item>
          <Form.Item
            label={<p style={{ fontSize: '1vw', margin: 0 }}>Destination</p>}
            name="order_type"
          >
            <span className="form-value">
              {String(orderDetails?.order_type).replace(/_/g, ' ')}
            </span>
          </Form.Item>
          <Form.Item
            label={<p style={{ fontSize: '1vw', margin: 0 }}>Vendor Name</p>}
            name="vendor"
          >
            <span className="form-value">{orderDetails?.vendor}</span>
          </Form.Item>
          <Form.Item
            label={<p style={{ fontSize: '1vw', margin: 0 }}>Warehouse Name</p>}
            name="warehouse"
          >
            <span className="form-value">{orderDetails?.warehouse}</span>
          </Form.Item>
          <Form.Item
            label={<p style={{ fontSize: '1vw', margin: 0 }}>Order Status</p>}
            name="order_status"
          >
            <span className="form-value">{orderDetails?.order_status}</span>
          </Form.Item>
          <Form.Item
            label={<p style={{ fontSize: '1vw', margin: 0 }}>Total Price $</p>}
            name="total_price"
          >
            <span className="form-value">{orderDetails?.total_price}</span>
          </Form.Item>
          <Form.Item
            label={<p style={{ fontSize: '1vw', margin: 0 }}>Total Volume</p>}
            name="total_volume"
          >
            <span className="form-value">{orderDetails?.total_volume}</span>
          </Form.Item>
          <Form.Item
            label={<p style={{ fontSize: '1vw', margin: 0 }}>Transport</p>}
            name="transport"
          >
            <span className="form-value">{orderDetails?.transport ? orderDetails?.transport.transport_type : 'No Transport' }</span>
          </Form.Item>
        </Form>
        <Table
          title={() => (
            <p
              style={{
                fontSize: '1.1vw',
                textAlign: 'center',
              }}
            >
              Lost Items List
            </p>
          )}
          dataSource={lostItemsTableData as []}
          columns={lostItemsColumns as []}
          scroll={scrollSize}
          pagination={false}
          size={'small'}
          bordered={true}
          className={'order-preview-right-items-table'}
          rowClassName={'default-table-row-height'}
        />
      </div>
      <Table
        pagination={false}
        dataSource={orderDetails?.items}
        columns={columns}
      />

      {editMode && (
        <>
          <Button
            type="primary"
            onClick={handleUpdateOrder}
            style={{ marginTop: '16px' }}
          >
            Update Order
          </Button>
          <Button
            danger
            onClick={handleCancelEdit}
            style={{ marginLeft: '8px' }}
          >
            Cancel update
          </Button>
        </>
      )}

      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        {orderDetails?.order_status === 'new' &&
          !editMode &&
          userRole === 'vendor' && (
            <>
              <Button type="primary" onClick={handleEditOrder}>
                Edit Order
              </Button>
              <Button
                danger
                onClick={handleCancelOrder}
                style={{ marginLeft: '8px' }}
              >
                Cancel Order
              </Button>
            </>
          )}
        {orderDetails?.order_status === 'processing' &&
          orderDetails?.order_type === 'from_warehouse' &&
          userRole === 'vendor' && (
            <>
              <span style={{ marginRight: '8px', color: 'red' }}>
                Confirm order when it's delivered.
              </span>
              <Button
                type="primary"
                onClick={() => setShowConfirmationModal(true)}
              >
                Confirm Delivery
              </Button>
            </>
          )}
      </div>
      <div style={{ textAlign: 'right', marginTop: '16px' }}>
        {/* ... (existing buttons) */}
        {userRole === 'manager' &&
          orderDetails?.order_status === 'new' &&
          !editMode && (
            <>
              <Button type="primary" onClick={handleConfirmOrder}>
                Confirm Order
              </Button>
              <Button
                danger
                onClick={handleRejectOrder}
                style={{ marginLeft: '8px' }}
              >
                Reject Order
              </Button>
            </>
          )}
      </div>
      {orderDetails && (
        <Accept
          isPopupVisible={showConfirmationModal}
          hidePopup={hideDeliveryPopup}
          orderData={{
            orderData: convertToIOrderData(orderDetails),
            setOrderData: setOrderDetails,
          }}
          onSuccessDeliver={handleSuccessDeliver}
        ></Accept>
      )}

      {orderDetails && (
        <ChooseTransport
          acceptData={orderDetails}
          isPopupVisible={showTransportConfirmationModal}
          hidePopup={hidePopup}
          success={handleSuccessConfirm}
        />
      )}
      <Modal
        title="Confirm Cancel Order"
        open={showCancelConfirmationModal}
        onOk={handleConfirmCancelOrder}
        onCancel={() => setShowCancelConfirmationModal(false)}
      >
        <p>Are you sure you want to cancel this order?</p>
      </Modal>
    </Modal>
  );
};

export default OrderActiveDetails;
