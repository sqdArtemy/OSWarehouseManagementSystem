import React, { useEffect, useState } from 'react';
import './companies.scss';
import { Table } from 'antd';
import { companyApi } from '../../../index';


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
      title: 'Company Address',
      dataIndex: 'companyAddress',
      key: 'companyAddress',
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


    companyApi.getAll().then(data => {
      if (data.success) {
        const companiesSource = [];

        if(data.data.body && data.data.body.length){
          let i =0;
          for (let company of data.data.body){
            companiesSource.push({
              key: (i + 1).toString(),
              companyName: company.company_name,
              companyAddress: company.company_address,
              companyEmail: company.company_email,
              companyOwner: 'HuivPalto',
            })
          }
          setDataSource(companiesSource);
        }
      }
    })

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
