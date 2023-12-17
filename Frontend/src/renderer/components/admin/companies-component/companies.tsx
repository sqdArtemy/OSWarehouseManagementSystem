import React, { useEffect, useState } from 'react';
import './companies.scss';
import { Table } from 'antd';
import { companyApi, userApi } from '../../../index';

export interface IOrderData {
  fromWarehouse: string;
  toWarehouse: string;
  amount: string;
  price: string;
  created_at: string;
  transport_type: string;
  status: string;
}

export default function AdminСompanies() {
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [dataSource, setDataSource] = useState([]);

  const placeholderRowCount = 3;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyOwner: '',
    }),
  );

  let tableData = dataSource.length > 0 ? dataSource : placeholderData;
  if (tableData.length < placeholderRowCount) {
    tableData = [...tableData, ...placeholderData.slice(tableData.length + 1)];
  }

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      align: 'center',
    },
    {
      title: 'Company Email',
      dataIndex: 'companyEmail',
      key: 'companyEmail',
      align: 'center',
    },
    {
      title: 'Company Owner',
      dataIndex: 'companyOwner',
      key: 'companyOwner',
      align: 'center',
    },
    {
      title: 'Number Of Employees',
      dataIndex: 'employees',
      key: 'employees',
      align: 'center',
    },
  ];

  let data = [];
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
        x: vw * 0.35,
        y: vh * 0.6,
      });
    };

    calculateScrollSize();
    window.addEventListener('resize', calculateScrollSize);

    companyApi.getAll().then(async (data) => {
      if (data.success) {
        const companiesSource = [];
        let users = [];

        const usersResponse = await userApi.getAllUsers({});
        if (usersResponse.success && usersResponse.data.body) {
          users = usersResponse.data.body;
        }

        if (data.data.body && data.data.body.length) {
          let i = 0;
          for (let company of data.data.body) {
            const user = users.find((user) => {
              return (
                ['manager', 'vendor'].includes(user.user_role) &&
                user.company === company.company_id
              );
            });
            let employees = 0;

            employees = users.filter((user) => {
              return (
                user.company === company.company_id &&
                user.user_role !== 'admin'
              );
            }).length;

            companiesSource.push({
              key: (i + 1).toString(),
              companyName: company.company_name,
              companyEmail: company.company_email,
              companyOwner: user
                ? user.user_name + ' ' + user.user_surname
                : '',
              employees,
            });
          }
          setDataSource(companiesSource);
        }
      }
    });

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  return (
    <div className="admin-companies-container">
      <div className={'admin-companies-table-container'}>
        <div className={'admin-companies-table-header-container'}>
          <span className={'admin-companies-table-header'}>COMPANIES</span>
        </div>
        <Table
          dataSource={tableData as []}
          columns={columns as []}
          scroll={scrollSize}
          pagination={false}
          size={'middle'}
          className={'admin-companies-table'}
          bordered={true}
          style={{ fontSize: '1.5vw' }}
          rowClassName={'highlight-bottom-border highlight-left-border'}
        />
      </div>
    </div>
  );
}
