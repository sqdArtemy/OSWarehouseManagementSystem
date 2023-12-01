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
import { productApi, rackApi, warehouseApi } from '../../index';
import { normalizeRacksForGrid } from '../../services/utils/normalizeRacksForGrid';

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

    warehouseApi.getWarehouse(Number(warehouse_id)).then((data) => {
      if(data.success && data.data?.data){
        setGridData(normalizeRacksForGrid(data.data.data.racks));
      }
    })

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
      itemName: 'Ravshanbek',
      itemWeight: '65 kg',
      itemVolume: '60 m3',
      itemCount: '1',
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
    setRackData(record);
    if(record && record.rack_id) {
      const productsResponse = await productApi.getAllProducts({});
      const products = productsResponse.success ? productsResponse.data?.body : [];
      const result = await rackApi.getRack(record.rack_id);
        if(result.success) {
          const rack = result.data?.body;

          if(rack){
            const inventories = rack.inventories;
            const data = [];
            let index = 0;

            for (let inventory of inventories){
              const product = products.find(product => {
                return product.product_id === inventory.product
              });

              let itemName = '', totalWeight = 0, itemType = '';

              if(product){
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
              })
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
            {warehouseData.type} Storage
          </span>
          <span className={'generalized-detail-header-name'}>
            {warehouseData.warehouseName} {warehouse_id}
          </span>
          {isForSupervisor ? (
            <span className={'generalized-detail-header-btns'}>
              <Button type={'primary'}>Add Rack</Button>
              <Button type={'primary'}>Add Multiple Racks</Button>
            </span>
          ) : null}
        </span>
        <RacksGrid
          handleCellClick={handleRackClick}
          isForSupervisor={isForSupervisor}
          gridData={gridData}
        />
        <Inventory
          isInventoryPopupVisible={isInventoryPopupVisible}
          hidePopup={hidePopup}
          rackData={{ rackData, setRackData }}
          inventoryData={{inventoryData, setInventoryData}}
        />
      </div>
      <div className={'generalized-detail-right'}>
        <div className={'generalized-detail-doughnut-chart'}>
          <Doughnut
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '50%',
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