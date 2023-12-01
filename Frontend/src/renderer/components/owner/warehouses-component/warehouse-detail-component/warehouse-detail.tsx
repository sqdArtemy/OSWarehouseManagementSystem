import React from 'react';
import GeneralizedDetail from '../../../detail-component/generalized-detail';
import { userApi } from '../../../../index';

export default function WarehouseDetail() {
  return <GeneralizedDetail isForSupervisor={userApi.getUserData.user_role === 'supervisor'} />;
}
