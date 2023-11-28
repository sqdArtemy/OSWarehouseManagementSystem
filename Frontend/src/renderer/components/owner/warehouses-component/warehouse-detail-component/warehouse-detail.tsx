import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './warehouse-detail.scss';
import { IWarehouseData } from '../warehouses';
import RacksGrid from '../../../racks-grid-component/racks-grid';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Table } from 'antd';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function WarehouseDetail() {
  const { warehouse_id } = useParams();
  const location = useLocation();
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [dataSource, setDataSource] = useState([]);
  const { state } = location;
  const warehouseData: IWarehouseData = state.locWarehouseData;

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
        y: vh * 0.4,
      });
    };

    calculateScrollSize();
    window.addEventListener('resize', calculateScrollSize);

    // warehouseApi.getAllWarehouses({}).then(async (result) => {
    //   const warehouses = result.data?.body;
    //   if (warehouses?.length) {
    //     const allUsers = (await userApi.getAllUsers({})).data.body;
    //     for (let i = 0; i < warehouses.length; i++) {
    //       const user = allUsers?.find(
    //         (user) => (user.user_id = warehouses[i].supervisor),
    //       );
    //       data.push({
    //         key: (i + 1).toString(),
    //         warehouseName: warehouses[i].warehouse_name,
    //         supervisor: user.user_name + ' ' + user.user_surname,
    //         address: warehouses[i].warehouse_address,
    //         type: warehouses[i].warehouse_type,
    //         capacity:
    //           warehouses[i].remaining_capacity +
    //           '/' +
    //           warehouses[i].overall_capacity,
    //         warehouse_id: warehouses[i].warehouse_id,
    //         overall_capacity: warehouses[i].overall_capacity,
    //         remaining_capacity: warehouses[i].remaining_capacity,
    //       });
    //     }
    //     setDataSource(data);
    //   }
    // });

    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  const handleOnRowClick = (e, record, rowIndex) => {
    console.log(record, rowIndex, e);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'itemName',
      key: 'itemName',
      align: 'center',
    },
    {
      title: 'Weight',
      dataIndex: 'itemWeight',
      key: 'itemWeight',
      align: 'center',
    },
    {
      title: 'Volume',
      dataIndex: 'itemVolume',
      key: 'itemVolume',
      align: 'center',
    },
    {
      title: 'Count',
      dataIndex: 'itemCount',
      key: 'itemCount',
      align: 'center',
    },
  ];

  const data: ChartData<'doughnut', any, any> = {
    labels: ['Occupied', 'Free'],
    datasets: [
      {
        label: 'Racks',
        data: [12, 19],
        backgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      itemName: '',
      itemWeight: '',
      itemVolume: '',
      itemCount: '',
    }),
  );

  let tableData = dataSource.length > 0 ? dataSource : placeholderData;
  if (tableData.length < placeholderRowCount) {
    tableData = [...tableData, ...placeholderData.slice(tableData.length + 1)];
  }

  return (
    <div className={'warehouse-detail-container'}>
      <div className={'warehouse-detail-left'}>
        <span className={'warehouse-detail-header'}>
          <span className={'warehouse-detail-header-type'}>
            {warehouseData.type} Storage
          </span>
          <span className={'warehouse-detail-header-name'}>
            {warehouseData.warehouseName} {warehouse_id}
          </span>
        </span>
        <RacksGrid />
      </div>
      <div className={'warehouse-detail-right'}>
        <div className={'warehouse-detail-doughnut-chart'}>
          <Doughnut
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '50%',
            }}
          />
        </div>
        <div className={'warehouse-detail-items-table-container'}>
          <span className={'warehouse-detail-items-table-header'}>
            Items List
          </span>
          <div className={'warehouse-detail-items-table'}>
            <Table
              dataSource={tableData as []}
              columns={columns as []}
              scroll={scrollSize}
              pagination={false}
              size={'small'}
              bordered={true}
              style={{ fontSize: '1.5vw' }}
              onRow={(record, rowIndex) => {
                return {
                  onClick: (event) => handleOnRowClick(event, record, rowIndex), // click row
                };
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
