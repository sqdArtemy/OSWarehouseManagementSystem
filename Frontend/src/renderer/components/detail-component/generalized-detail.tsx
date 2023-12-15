import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './generalized-detail.scss';
import { IWarehouseData } from '../owner/warehouses-component/warehouses';
import RacksGrid from '../racks-grid-component/racks-grid';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Button, Table } from 'antd';
import Inventory from './inventory-component/inventory';
import { productApi, rackApi, statsApi, warehouseApi } from '../../index';
import { normalizeRacksForGrid } from '../../services/utils/normalizeRacksForGrid';
import AddRack from './add-rack-component/add-rack';
import AddMultipleRacks from './add-multiple-racks-component/add-multiple-racks';
import EditRack from './edit-rack-component/edit-rack';
import { useError } from '../error-component/error-context';
import { useLoading } from '../loading-component/loading';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GeneralizedDetail({ isForSupervisor = false }) {
  const { warehouse_id } = useParams();
  const location = useLocation();
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [dataSource, setDataSource] = useState([]);
  const [isInventoryPopupVisible, setIsInventoryPopupVisible] = useState(false);
  const [rackData, setRackData] = useState({});
  const [inventoryData, setInventoryData] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [isAddRackPopupVisible, setIsAddRackPopupVisible] = useState(false);
  const { showError } = useError();
  const { startLoading, stopLoading } = useLoading();
  const [isAddMultipleRacksPopupVisible, setIsAddMultipleRacksPopupVisible] =
    useState(false);
  const { state } = location;
  const warehouseData: IWarehouseData = state.locWarehouseData;
  const [chartData, setChartData] = useState<ChartData<'doughnut', any, any>>({
    labels: ['Occupied', 'Free'],
    datasets: [
      {
        label: 'Capacity of warehouse',
        data: [
          state.locWarehouseData.capacity - state.locWarehouseData.remaining,
          state.locWarehouseData.remaining,
        ],
        backgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  });

  const updateChartData = async () => {
    startLoading();
    const result = await warehouseApi.getWarehouse(Number(warehouse_id));
    stopLoading();
    if (result.success) {
      const data = result.data?.data;
      setChartData({
        labels: ['Occupied', 'Free'],
        datasets: [
          {
            label: 'Capacity of warehouse',
            data: [
              data.overall_capacity - data.remaining_capacity,
              data.remaining_capacity,
            ],
            backgroundColor: ['#FF6384', '#36A2EB'],
          },
        ],
      });
    } else {
      showError(result.message);
    }
  };

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

    console.log('Warehouse ID: ', warehouse_id);

    startLoading();
    warehouseApi.getWarehouse(Number(warehouse_id)).then(async (data) => {
      if (data.success && data.data?.data) {
        setGridData(normalizeRacksForGrid(data.data.data.racks));
      } else {
        showError(data.message);
      }
      stopLoading();

      setChartData({
        labels: ['Occupied', 'Free'],
        datasets: [
          {
            label: 'Capacity of warehouse',
            data: [
              warehouseApi.warehouseData.overall_capacity -
                warehouseApi.warehouseData.remaining_capacity,
              warehouseApi.warehouseData.remaining_capacity,
            ],
            backgroundColor: ['#FF6384', '#36A2EB'],
          },
        ],
      });

      const productsStatsResponse = await statsApi.getProductsStats();
      if (productsStatsResponse.success) {
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
    });

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
      title: 'Average Expiry',
      dataIndex: 'expiry',
      key: 'expiry',
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

  const handleAddRack = () => {
    console.log('Add Rack');
    setIsAddRackPopupVisible(true);
  };

  const handleAddMultipleRacks = () => {
    console.log('Add Multiple Racks');
    setIsAddMultipleRacksPopupVisible(true);
  };

  const hideAddRackPopup = () => {
    setIsAddRackPopupVisible(false);
  };

  const hideAddMultipleRacksPopup = () => {
    setIsAddMultipleRacksPopupVisible(false);
  };

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      itemName: '',
      expiry: '',
      itemVolume: '',
      itemCount: '',
    }),
  );

  let tableData = dataSource.length > 0 ? dataSource : placeholderData;
  if (tableData.length < placeholderRowCount) {
    tableData = [...tableData, ...placeholderData.slice(tableData.length + 1)];
  }

  const hidePopup = () => {
    setIsInventoryPopupVisible(false);
  };

  const handleRackClick = async (record) => {
    console.log(record);
    setRackData(record);
    if (record && record.rack_id) {
      const productsResponse = await productApi.getAllProducts({});
      const products = productsResponse.success
        ? productsResponse.data?.body
        : [];
      const result = await rackApi.getRack(record.rack_id);
      if (result.success) {
        const rack = result.data?.body;

        if (rack) {
          const inventories = rack.inventories;
          const data = [];
          let index = 0;

          for (let inventory of inventories) {
            const product = products.find((product) => {
              return product.product_id === inventory.product;
            });

            let itemName = '',
              totalWeight = 0,
              itemType = '';

            if (product) {
              itemName = product.product_name;
              itemType = product.is_stackable ? 'Stackable' : 'Non stackable';
              totalWeight = product.volume * inventory.quantity;
            }

            data.push({
              key: (index++).toString(),
              itemName: itemName,
              totalWeight: totalWeight,
              totalVolume: inventory.total_volume,
              totalCount: inventory.quantity,
              expiryDate: inventory.expiry_date,
              itemType: itemType,
              itemId: inventory.product,
            });
          }
          setInventoryData(data);
        } else {
          setInventoryData([]);
        }
      }
    } else {
      setInventoryData([]);
    }
    setIsInventoryPopupVisible(true);
  };

  return (
    <div className={'generalized-detail-container'}>
      <div className={'generalized-detail-left'}>
        <span className={'generalized-detail-header'}>
          <span className={'generalized-detail-header-type'}>
            {warehouseData.type
              .split(' ')
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
              )
              .join(' ')}{' '}
            Storage
          </span>
          <span className={'generalized-detail-header-name'}>
            {warehouseData.warehouseName}
          </span>
          {isForSupervisor ? (
            <span className={'generalized-detail-header-btns'}>
              <Button type={'primary'} onClick={handleAddRack}>
                Add Rack
              </Button>
              <Button type={'primary'} onClick={handleAddMultipleRacks}>
                Add Multiple Racks
              </Button>
            </span>
          ) : null}
          <AddRack
            isPopupVisible={isAddRackPopupVisible}
            hidePopup={hideAddRackPopup}
            updateGridData={setGridData}
          />
          <AddMultipleRacks
            isPopupVisible={isAddMultipleRacksPopupVisible}
            hidePopup={hideAddMultipleRacksPopup}
            updateGridData={setGridData}
          />
        </span>
        <RacksGrid
          handleCellClick={handleRackClick}
          externalGridData={gridData}
        />
        <Inventory
          isInventoryPopupVisible={isInventoryPopupVisible}
          hidePopup={hidePopup}
          rackData={{ rackData, setRackData }}
          inventoryData={{ inventoryData, setInventoryData }}
          updateChartData={updateChartData}
          updateGridData={setGridData}
        />
      </div>
      <div className={'generalized-detail-right'}>
        <div className={'generalized-detail-doughnut-chart'}>
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '50%',
              plugins: {
                tooltip: {
                  titleFont: {
                    size: 20,
                  },
                  bodyFont: {
                    size: 15,
                  },
                },
                legend: {
                  labels: {
                    font: {
                      size: 25,
                    },
                  },
                },
              },
            }}
          />
        </div>
        <div className={'generalized-detail-items-table-container'}>
          <span className={'generalized-detail-items-table-header'}>
            Items List
          </span>
          <div className={'generalized-detail-items-table'}>
            <Table
              dataSource={tableData as []}
              columns={columns as []}
              scroll={scrollSize}
              pagination={false}
              size={'small'}
              bordered={true}
              style={{ fontSize: '1.5vw' }}
              rowClassName={'default-table-row-height'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
