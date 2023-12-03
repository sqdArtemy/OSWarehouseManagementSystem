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
  const [transport, setTransport] = useState([]);
  const [scrollSize, setScrollSize] = useState({ x: 0, y: 0 });
  const [showColumn, setShowColumn] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);


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
      title: 'Transport',
      dataIndex: 'transport',
      key: 'transport',
      align: 'center',
    },
    {
      title: 'Total Volume (m^3)',
      dataIndex: 'totalVolume',
      key: 'totalVolume',
      align: 'center',
    },
    {
      title: 'Choice',
      dataIndex: 'choice',
      key: 'choice',
      align: 'center',
      width: '20%',
      render: (_, record) =>
        record.transport ? (
            <span className={'table-actions-container'}>
              <Input type={'radio'} name={'choice'} style={{ fontSize: '0.9vw' }} />
            </span>
          ) : null
    },
  ];


  useEffect(() => {

    setTransport([
      {
        key: '1',
        transport: 'Dildo',
        totalVolume: '100',
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



  let transportTableData = transport.length > 0 ? transport : placeholderData;
  if (transportTableData.length < placeholderRowCount) {
    transportTableData = [...transportTableData, ...placeholderData.slice(transportTableData.length + 1)];
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
        name="choose-delivery"
        size={'middle'}
        style={{ maxWidth: '100%', textAlign: 'start', fontSize: '3vw' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="total-volume"
          label={<p style={{ fontSize: '1vw' }}>Total Volume</p>}
          rules={[{ required: true }]}
        >
          <Input style={{ fontSize: '0.9vw' }} />
        </Form.Item>
        <Table
          dataSource={transportTableData as []}
          columns={columns as []}
          scroll={scrollSize}
          pagination={false}
          size={'small'}
          bordered={true}
          className={'transport-data-table'}
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
