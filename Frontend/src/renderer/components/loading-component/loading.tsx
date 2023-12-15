import React, { createContext, useContext } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { useState } from 'react';

const LoadingContext = createContext({});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setLoading] = useState(false);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <LoadingComponent />
    </LoadingContext.Provider>
  );
};

export const LoadingComponent = () => {
  const { isLoading } = useLoading();
  if (!isLoading) return null;

  return (
    <div
      style={{
        zIndex: 9999,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Dark semi-transparent background
      }}
    >
      <Spin indicator={<LoadingOutlined style={{ fontSize: '15vw' }} spin />} />
    </div>
  );
};
