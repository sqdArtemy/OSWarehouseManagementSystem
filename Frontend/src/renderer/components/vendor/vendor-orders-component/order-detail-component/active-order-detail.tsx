import React from 'react';
import { useParams } from 'react-router-dom';

export const ActiveOrderDetail = () => {
  const { order_id } = useParams();
  return (
    <div>
      {/* Your component content goes here */}
    </div>
  );
};

