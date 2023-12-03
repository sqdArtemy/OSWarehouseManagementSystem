import React, { useEffect, useState } from "react";
import { Button, Form, FormInstance, Input, Modal, Select, Table } from "antd";

export interface INewAcceptData{
  from?: string;
  to?: string;
  createdAt?: string;
}

export default function Accept(
  {
    isPopupVisible,
    hidePopup,
    acceptData,
  }: {
    isPopupVisible: boolean;
    hidePopup: () => void;
    acceptData: {
      acceptData:  INewAcceptData;
      setAcceptData: (userData: unknown) => void;
    }
  })
{
  const [fromTo, setFromTo] = useState([]);
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [showColumn, setShowColumn] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const getStatusDependentColumnName = () => {
    switch (selectedStatus) {
      case 'damaged':
        return 'damaged';
      case 'lost':
        return 'lost';
      default:
        return ' ';
    }
  };

  const placeholderRowCount = 30;

  const placeholderData = Array.from(
    { length: placeholderRowCount },
    (_, index) => ({
      key: (index + 1).toString(),
      from: '',
      to: '',
      amount: '',
    }),
  );

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
      title: 'Space (m^3)',
      dataIndex: 'space',
      key: 'space',
      align: 'center',
    },
/*       showColumn && */
    {
      title: getStatusDependentColumnName().charAt(0).toUpperCase() + getStatusDependentColumnName().slice(1),
      dataIndex: getStatusDependentColumnName(),
      key: getStatusDependentColumnName(),
      width: '20%',
      align: 'center',
      render: (_, record) =>
        record.name ? (
          showColumn ? (
            <span className={'table-actions-container'}>
              <Input style={{ fontSize: '0.9vw' }} />
            </span>
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
    {
      title: 'Space (m^3)',
      dataIndex: 'space',
      key: 'space',
      align: 'center',
    },
  ];

  const [currentColumns, setCurrentColumns] = useState(columns)

  useEffect(() => {

    setFromTo([
      {
        key: '1',
        name: 'Dildo',
        amount: '100',
        space: '100',
      },
    ]);
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
    const newAcceptData = formRef.current?.getFieldsValue();
    let check = false;
    for (let key in newAcceptData) {
      if (newAcceptData[key]) {
        check = true;
      }
    }
    if (!check) {
      hidePopup();
      handleReset();
    } else {
      hidePopup();
    }
    acceptData.setAcceptData(newAcceptData);
  };

  const options = [
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
  ]


  const onStatusChange = (selectedOption) => {
      setSelectedStatus(selectedOption);
      setShowColumn(!selectedOption.includes('delivered'));
  };

  let fromToTableData = fromTo.length > 0 ? fromTo : placeholderData;
  if (fromToTableData.length < placeholderRowCount) {
    fromToTableData = [...fromToTableData, ...placeholderData.slice(fromToTableData.length + 1)];
  }

  return(
    <Modal
      title={<p style={{ textAlign:'center',fontSize: '1.2vw' }}>Delivery Process</p>}
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
            rowSelection={}
            dataSource={fromToTableData as []}
            columns={columns as []}
            scroll={scrollSize}
            pagination={false}
            size={'small'}
            bordered={true}
            className={'requests-data-table'}
            rowClassName={'highlight-bottom-border highlight-left-border'}
          />

        <Form.Item
          {...tailLayout}
          labelAlign={'right'}
          style={{ marginTop: '1vw',marginBottom: '1vw' }}
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
