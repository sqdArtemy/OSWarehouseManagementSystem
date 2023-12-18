import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import './dashboard.scss';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { ChartData } from 'chart.js';
import { Badge, Descriptions, Table } from 'antd';
import type { DescriptionsProps } from 'antd';
import { getLostItems } from '../../supervisor/requests-component/util';
import { statsApi } from '../../../index';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
export default function OwnerDashboard() {
  const [productsScrollSize, setProductsScrollSize] = useState({ x: 0, y: 0 });
  const [lostItemsScrollSize, setLostItemsScrollSize] = useState({
    x: 0,
    y: 0,
  });
  const [lostItemsDataSource, setLostItemsDataSource] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [dataFromBackend, setDataFromBackend] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const lostItemsResponse = await statsApi.getLostItems({});
      if (lostItemsResponse.success) {
        if (lostItemsResponse.data.body.length)
          setLostItemsDataSource(
            lostItemsResponse.data.body.map((item) => {
              return {
                name: item.product_name,
                amount: item.total_quantity,
              };
            }),
          );
      }

      const productsStatsResponse = await statsApi.getProductsStats();
      if (productsStatsResponse.success) {
        if (productsStatsResponse.data.body.length)
          setDataSource(
            productsStatsResponse.data.body.map((item) => {
              return {
                itemName: item.product_name,
                itemVolume: item.total_volume_sum,
                itemCount: item.products_number,
                expiry: item.average_expiry_date,
              };
            }),
          );
      }

      const barChartResponse = await statsApi.getWarehouseItems({});
      console.log(barChartResponse);
      if (barChartResponse.success && barChartResponse.data.body)
        setDataFromBackend(barChartResponse.data.body);
    };

    fetchData();

    const calculateScrollSize = () => {
      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
      );
      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0,
      );

      setLostItemsScrollSize({
        x: vw * 0.2,
        y: vh * 0.3,
      });
      setProductsScrollSize({
        x: vw * 0.3,
        y: vh * 0.25,
      });
    };
    calculateScrollSize();

    window.addEventListener('resize', calculateScrollSize);
    return () => window.removeEventListener('resize', calculateScrollSize);
  }, []);

  // Preparing data for the charts
  const chartData = (object, key) =>
    ({
      labels: Object.keys(object[key]),
      datasets: [
        {
          label: key
            .split('_')
            .join(' ')
            .replace(
              /\w\S*/g,
              (txt) =>
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
            ),
          data: Object.values(object[key]),
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
          ],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
          borderWidth: 1,
        },
      ],
    }) as ChartData<'bar', any, any>;

  const options = (title) =>
    ({
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 15,
          },
        },
      },
    }) as ChartOptions<'bar'>;

  const lostItemColumns = [
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

  const placeholderRowCount = 8;

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

  const columns = [
    {
      title: 'Name',
      dataIndex: 'itemName',
      key: 'itemName',
      align: 'center',
    },
    {
      title: 'Expiry Duration (days)',
      dataIndex: 'expiry',
      key: 'expiry',
      align: 'center',
    },
    {
      title: 'Volume (m³)',
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

  let tableData = dataSource.length > 0 ? dataSource : placeholderData;
  if (tableData.length < placeholderRowCount) {
    tableData = [...tableData, ...placeholderData.slice(tableData.length + 1)];
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-left-side-container">
        <span className="dashboard-left-side-header">DASHBOARD</span>
        {Object.keys(dataFromBackend).length > 0 && (
          <div className="dashboard-left-side-charts-container">
            <div className="chart-container">
              <Bar
                data={
                  dataFromBackend && dataFromBackend['orders_count']
                    ? chartData(dataFromBackend, 'orders_count')
                    : {
                        labels: [],
                        datasets: [],
                      }
                }
                options={options('Orders Count Statistics')}
              />
            </div>
            <div className="chart-container">
              <Bar
                data={
                  dataFromBackend && dataFromBackend['orders_volume']
                    ? chartData(dataFromBackend, 'orders_volume')
                    : {
                        labels: [],
                        datasets: [],
                      }
                }
                options={options('Orders Volume Statistics')}
              />
            </div>

            <div className="chart-container">
              <Bar
                data={
                  dataFromBackend && dataFromBackend['orders_price']
                    ? chartData(dataFromBackend, 'orders_price')
                    : {
                        labels: [],
                        datasets: [],
                      }
                }
                options={options('Orders Price Statistics')}
              />
            </div>
          </div>
        )}
      </div>
      <div className="dashboard-right-side-container">
        <div className={'dashboard-right-side-left-tables-container'}>
          <div className={'dashboard-right-side-products-distribution-table'}>
            <Table
              title={() => (
                <p style={{ fontSize: '1.1vw', textAlign: 'center' }}>
                  Products Distribution
                </p>
              )}
              dataSource={tableData as []}
              columns={columns as []}
              scroll={productsScrollSize}
              pagination={false}
              size={'small'}
              bordered={true}
              style={{ fontSize: '1vw' }}
              rowClassName={'default-table-row-height'}
            />
          </div>
          <div className={'dashboard-right-side-lost-items-table'}>
            <Table
              title={() => (
                <p style={{ fontSize: '1.1vw', textAlign: 'center' }}>
                  Lost Items
                </p>
              )}
              dataSource={lostItemsTableData as []}
              columns={lostItemColumns as []}
              scroll={lostItemsScrollSize}
              pagination={false}
              size={'small'}
              bordered={true}
              style={{ fontSize: '1vw' }}
              className={'dashboard-right-side-lost-items-table'}
              rowClassName={'default-table-row-height'}
            />
          </div>
        </div>
        {/*<Descriptions*/}
        {/*  title={<p style={{ fontSize: '1.1vw' }}>Order Status Statistics</p>}*/}
        {/*  bordered*/}
        {/*  column={1}*/}
        {/*  className={'dashboard-right-side-order-status-table'}*/}
        {/*  contentStyle={{ fontSize: '0.9vw' }}*/}
        {/*  labelStyle={{ fontSize: '0.9vw' }}*/}
        {/*>*/}
        {/*  {items.map((item) => (*/}
        {/*    <Descriptions.Item label={item.label}>*/}
        {/*      {item.children}*/}
        {/*    </Descriptions.Item>*/}
        {/*  ))}*/}
        {/*</Descriptions>*/}
      </div>
    </div>
  );
}
