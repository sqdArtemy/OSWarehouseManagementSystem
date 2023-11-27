import React from 'react';
import './create-order-details.scss'; // Add your stylesheet if needed
import { Table } from 'antd';

export default function CreateOrderDetails({ orderDetails }) {
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

  const data = [];
  orderDetails.forEach((order) => (
    data.push({
    key: order.warehouse_id.toString(),
    company_name: order.company.company_name,
    warehouse_name: order.warehouse_name,
    warehouse_address: order.warehouse_address,
  })));

  return (
    <div className="create-order-details-container">
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        size={'small'}
        bordered={true}
        rowClassName={'highlight-bottom-border highlight-left-border'}
      />
    </div>
  );
}
