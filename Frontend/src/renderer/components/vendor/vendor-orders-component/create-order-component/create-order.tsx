import React, { useEffect, useState } from 'react';
import { Button, Form, FormInstance, Select, Tag, InputNumber } from 'antd';
import { vendorApi, companyApi, warehouseApi, productApi } from '../../../../index';
import { useError } from '../../../error-component/error-context';
import './create-order.scss';

export default function CreateOrder({
                                      onAddOrderSuccess,
                                      onCancel,
                                    }: {
  onAddOrderSuccess: () => void;
  onCancel: () => void;
}) {
  const formRef = React.useRef<FormInstance>(null);
  const { showError } = useError();

  const [vendors, setVendors] = useState<Select['OptionType'][]>([]);
  const [companies, setCompanies] = useState<Select['OptionType'][]>([]);
  const [warehouses, setWarehouses] = useState<Select['OptionType'][]>([]);
  const [products, setProducts] = useState<Select['OptionType'][]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    { product: Select['OptionType']; quantity: number }[]
    >([]);

  const handleProductSelect = (value, option) => {
    const isProductAlreadySelected = selectedProducts.some(
      (item) => item.product.value === option.value
    );

    // If the product is not in the array, add it
    if (!isProductAlreadySelected) {
      const newSelectedProduct = { product: option, quantity: 1 };
      setSelectedProducts([...selectedProducts, newSelectedProduct]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    // Update the quantity for a selected product
    const updatedProducts = selectedProducts.map((item) =>
      item.product.value === productId ? { ...item, quantity } : item
    );
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (productId) => {
    // Remove a selected product
    const updatedProducts = selectedProducts.filter((item) => item.product.value !== productId);
    setSelectedProducts(updatedProducts);
  };

  const getProducts = async (companyId: number) => {
    const products = await productApi.getAllProducts({ company_id: companyId });
    const mapToOptions = (data) => {
      return data.map((item) => ({
        value: item.product_id,
        label: item.product_name,
        volume: item.volume,
        weight: item.weight
      }));
    };

    const fakeData = [
      { product_id: 1, product_name: 'banana', weight: 2, volume: 10 },
      { product_id: 2, product_name: 'apple', weight: 1.5, volume: 25 },
      { product_id: 3, product_name: 'orange', weight: 2.3, volume: 50 },
    ];
    setProducts(mapToOptions(fakeData));
  };

  const fetchProducts = async () => {
    const companyId = formRef.current?.getFieldValue(['Company'] as any);
    if (companyId) {
      await getProducts(companyId as number);
    }
  };

  useEffect(() => {
    // Fetch data for vendors and companies
    const warehouses: Select['OptionType'][] = [
      { value: 'to_warehouse', label: 'To Warehouse' },
      { value: 'from_warehouse', label: 'From Warehouse' },
    ];

    setWarehouses(warehouses);
    vendorApi
      .getAllVendors({})
      .then((data) => {
        const mapToOptions = (data) => {
          return data.map((item) => ({
            value: item.vendor_id,
            label: item.vendor_name,
          }));
        };
        setVendors(mapToOptions(data.data.body));
      })
      .then(async () => {
        const companies = await companyApi.getAll();
        const mapToOptions = (data) => {
          return data.map((item) => ({
            value: item.company_id,
            label: item.company_name,
          }));
        };
        setCompanies(mapToOptions(companies.data.body));
      });
  }, []);

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 13, span: 17 },
  };

  const onFinish = async () => {
    const newOrderData = formRef.current?.getFieldsValue();
    const items = [];

    for (let product of selectedProducts){
      items.push({
        quantity: product.quantity,
        product_id: product.product.value
      })
    }

    const response = await warehouseApi.findSuitableWarehousesForOrders({
      order_type: newOrderData['Warehouse'],
      company_id: newOrderData['Company'],
      items,
    });

    console.log(response);
    if (response.success) {
      onAddOrderSuccess();
    } else {
      showError(response.message);
    }
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  return (
    <div className="owner-profile-container">
      <div className="header">
        <span className="header-text">Create Order</span>
      </div>
      <Form
        {...layout}
        labelAlign={'left'}
        ref={formRef}
        name="add-order"
        size={'middle'}
        className="create-order-form" // Apply the main container class
        onFinish={onFinish}
      >
        <Form.Item
          name="Warehouse"
          label={<p className="form-label">Select Warehouse</p>}
          rules={[{ required: true }]}
        >
          <Select options={warehouses} className="form-input" />
        </Form.Item>
        <Form.Item
          name="Vendor"
          label={<p className="form-label">Select Vendor</p>}
          rules={[{ required: true }]}
        >
          <Select options={vendors} className="form-input" />
        </Form.Item>
        <Form.Item
          name="Company"
          label={<p className="form-label">Select Company</p>}
          rules={[{ required: true }]}
        >
          <Select options={companies} className="form-input" onChange={fetchProducts} />
        </Form.Item>
        <Form.Item
          name="Product"
          label={<p className="form-label">Select Product</p>}
          rules={[{ required: true }]}
        >
          <Select
            showSearch={}
            filterOption={(input, option) =>
              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            options={products}
            className="form-input"
            onSelect={handleProductSelect}
          />
        </Form.Item>
        {/* Add other order-related form fields */}
        {/* Display selected products and quantity controls */}
        <div className="selected-products-container">
          {selectedProducts.length > 0 && (
            <table className="selected-products-table">
              <thead>
              <tr>
                <th>Name</th>
                <th>Volume</th>
                <th>Weight</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
              {selectedProducts.map((item) => (
                <tr key={item.product.value}>
                  <td>{item.product.label}</td>
                  {/* Assuming that volume and weight are available as separate properties */}
                  <td>{item.product.volume} m^3</td>
                  <td>{item.product.weight} kg</td>
                  <td>
                    <InputNumber
                      min={1}
                      value={item.quantity}
                      onChange={(value) => handleQuantityChange(item.product.value, value)}
                    />
                  </td>
                  <td>
                    <Button type="link" onClick={() => handleRemoveProduct(item.product.value)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          )}
        </div>

        <Form.Item
          {...tailLayout}
          labelAlign={'right'}
          style={{ marginBottom: '1vw' }}
        >
          <Button
            htmlType="button"
            onClick={handleReset}
            className="form-button" // Apply the button class
          >
            Reset
          </Button>

          <Button type="primary" htmlType="submit" className="form-button">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
