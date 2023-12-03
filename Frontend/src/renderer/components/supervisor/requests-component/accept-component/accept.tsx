import React, { useEffect, useState } from 'react';
import { Button, Form, FormInstance, Input, Modal, Select, Table } from 'antd';
import { orderApi, productApi } from '../../../../index';
import { IOrderData } from '../requests';
import { ApiResponse } from '../../../../services/apiRequestHandler';

export default function Accept({
  isPopupVisible,
  hidePopup,
  orderData,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  orderData: {
    orderData: IOrderData;
    setOrderData: (orderData: IOrderData) => void;
  };
}) {
  const [itemsData, setItemsData] = useState([]);
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [showColumn, setShowColumn] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const getStatusDependentColumnName = () => {
    if (selectedStatus.includes('damaged')) return 'damaged';
    else if (selectedStatus.includes('lost')) return 'lost';
    return '';
  };

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      name: '',
      amount: '',
    }),
  );

  const columns = [
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
    {
      title:
        getStatusDependentColumnName().charAt(0).toUpperCase() +
        getStatusDependentColumnName().slice(1),
      dataIndex: getStatusDependentColumnName(),
      key: getStatusDependentColumnName(),
      width: (() => (showColumn ? '20%' : '0'))(),
      align: 'center',
      render: (_, record) =>
        record.name ? (
          showColumn ? (
            <Input style={{ fontSize: '0.9vw' }} />
          ) : null
        ) : null,
    },
  ];
  const columnsForDamaged = [
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

  const [currentColumns, setCurrentColumns] = useState(columns);

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
        x: vw * 0.3,
        y: vh * 0.3,
      });
    };
    calculateScrollSize();
    window.addEventListener('resize', calculateScrollSize);

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  useEffect(() => {
    // setFromTo([
    //   {
    //     key: '1',
    //     name: 'Dildo',
    //     amount: '100',
    //     space: '100',
    //   },
    // ]);
    if (isPopupVisible && orderData.orderData && formRef.current) {
      console.log(true);
      orderApi
        .getOrder(orderData.orderData.orderId)
        .then((res: ApiResponse) => {
          if (res.success) {
            const items = res.data.body.items;
            console.log('items', items);
            const products = productApi.getAllProducts({}).then((res) => {
              const products = res.data.body;
              const itemsMap = items.map((item, idx) => {
                const matchProduct = products.find((product) => {
                  return item.product === product.product_id;
                });
                if (matchProduct) {
                  return {
                    key: (idx + 1).toString(),
                    name: matchProduct.product_name,
                    amount: item.quantity,
                  };
                } else {
                  return {
                    key: (idx + 1).toString(),
                    name: '',
                    amount: '',
                  };
                }
              });
              console.log('itemsMap', itemsMap);
              setItemsData([...itemsMap]);
            });
          }
        });
    }
  }, [orderData]);

  const handleReset = () => {
    formRef.current?.resetFields();
  };
  const onCancel = () => {
    hidePopup();
    handleReset();
  };

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 13, span: 17 },
  };

  const formRef = React.useRef<FormInstance>(null);
  const onFinish = async () => {
    const newAcceptData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newAcceptData) {
      if (newAcceptData[key]) {
        check = true;
      }
    }
    if (!check) {
      hidePopup();
      handleReset();
    } else {
      hidePopup();
    }
    orderData.setOrderData(newAcceptData);
  };

  const options: Select['OptGroup'] = [
    {
      label: 'Delivered',
      value: 'delivered',
    },
    {
      label: 'Damaged',
      value: 'damaged',
    },
    {
      label: 'Lost',
      value: 'lost',
    },
  ];

  const onStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption);
    setShowColumn(!selectedOption.includes('delivered'));
  };

  let tableData = itemsData.length > 0 ? itemsData : placeholderData;
  if (tableData.length < placeholderRowCount) {
    tableData = [...tableData, ...placeholderData.slice(tableData.length + 1)];
  }

  return (
    <Modal
      title={
        <p style={{ textAlign: 'center', fontSize: '1.2vw' }}>
          Delivery Process
        </p>
      }
      width={'50vw'}
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
        name="accept-delivery"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="Delivery Status"
          label={<p style={{ fontSize: '1vw' }}>Delivery Status</p>}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={'Select status'}
            onChange={onStatusChange}
            style={{ minHeight: '2vw' }}
            options={options}
          />
        </Form.Item>
        <Table
          dataSource={tableData as []}
          columns={columns as []}
          scroll={scrollSize}
          pagination={false}
          size={'small'}
          bordered={true}
          className={'requests-data-table'}
          rowClassName={'default-table-row-height'}
        />

        <Form.Item
          {...tailLayout}
          labelAlign={'right'}
          style={{ marginTop: '1vw', marginBottom: '1vw' }}
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
