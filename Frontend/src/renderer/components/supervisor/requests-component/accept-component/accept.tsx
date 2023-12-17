import React, { useEffect, useState } from 'react';
import { Button, Form, FormInstance, Input, Modal, Select, Table } from 'antd';
import { orderApi, productApi, userApi } from '../../../../index';
import { IOrderData } from '../requests';
import { IApiResponse } from '../../../../services/apiRequestHandler';
import { getItems } from '../util';

export default function Accept({
  isPopupVisible,
  hidePopup,
  orderData,
  onSuccessDeliver,
}: {
  isPopupVisible: boolean;
  hidePopup: () => void;
  orderData: {
    orderData: IOrderData;
    setOrderData: (orderData: IOrderData) => void;
  };
  onSuccessDeliver: () => void;
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
            <Input
              onChange={(e) => {
                record[getStatusDependentColumnName()] = Number(e.target.value);
              }}
              style={{ fontSize: '0.9vw' }}
            />
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
  console.log(orderData);
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
      getItems(orderData).then((data) => {
        setItemsData(data);
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
    let response;
    if (selectedStatus === 'delivered' || userApi.userData.user_role === 'vendor') {
      response = await orderApi.changeStatusOfOrder(
        orderData.orderData.orderId,
        'delivered',
      );
    }

    if (selectedStatus == 'damaged') {
      const items = itemsData
        .map((value) => {
          return {
            product_id: value.id,
            quantity: value.damaged,
          };
        })
        .filter((item) => item.name !== '' && item.damaged !== 0);
      response = await orderApi.lostItems(orderData.orderData.orderId, 'damaged', items);
    } else if (selectedStatus == 'lost') {
      const items = itemsData
        .map((value) => {
          return {
            product_id: value.id,
            quantity: value.lost,
          };
        })
        .filter((item) => item.name !== '' && item.lost !== 0);
      response = await orderApi.lostItems(orderData.orderData.orderId, 'lost', items);
    }

    if(response.success && userApi.userData.user_role === 'vendor'){
      await orderApi.changeStatusOfOrder(orderData.orderData.orderId, 'finished');
    }

    onSuccessDeliver();
    hidePopup();
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

  const placeholderRowCount = 5;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      name: '',
      amount: '',
    }),
  );

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
