import { orderApi, statsApi } from '../../index';

export const getOrderStats = async (
  updateOrdersStatsTableData,
  ordersStatsColumns,
) => {
  const response = await statsApi.getOrderStats();
  if (response.success && response.data.body) {
    const data: any = [{}];
    let total = 0;

    console.log('orderStats resp', response.data.body);
    for (const column of ordersStatsColumns) {
      const key = column.dataIndex;
      const value = response.data.body[key] || 0;
      data[0][key] = value;
      total += value;
    }

    data[0].total = total;
    updateOrdersStatsTableData(data);
  }
};

export const processAllOrders = async (
  updateCurrentOrders,
  updateFinishedOrders,
  updateOrdersStatsTableData,
  ordersStatsColumns,
) => {
  const data = await orderApi.getAllOrders({});
  const orders = data.data?.body;
  console.log(orders);
  await getOrderStats(updateOrdersStatsTableData, ordersStatsColumns);
  if (orders?.length) {
    const finishedItems = [];
    const activeItems = [];
    let activeKey = 0;
    let finishKey = 0;
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      const vendor =
        order.order_type === 'to_warehouse' ? order.supplier : order.recipient;
      const warehouse =
        order.order_type === 'from_warehouse'
          ? order.supplier
          : order.recipient;

      const orderItem = {
        order_status: orders[i].order_status,
        order_type: orders[i].order_type,
        createdAt: orders[i].created_at,
        order_id: orders[i].order_id,
        vendor: vendor?.vendor_name,
        vendor_id: vendor?.vendor_id,
        warehouse: warehouse?.warehouse_name,
        warehouse_id: warehouse?.warehouse_id,
      };

      if (!['finished', 'cancelled'].includes(orderItem.order_status)) {
        orderItem.key = (activeKey++).toString();
        activeItems.push(orderItem);
      } else {
        orderItem.key = (finishKey++).toString();
        finishedItems.push(orderItem);
      }
    }

    updateFinishedOrders(finishedItems);
    updateCurrentOrders(activeItems);
  } else {
    updateCurrentOrders([]);
    updateFinishedOrders([]);
  }
};
