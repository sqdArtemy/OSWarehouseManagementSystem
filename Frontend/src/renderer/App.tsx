import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { SignIn } from './components/sign-in-component/sign-in';
import { OwnerDashboardLayout } from './components/owner/dashboard-layout-component/dashboard-layout';
import './App.css';
import './normalize.css';
import OwnerUsers from './components/owner/users-component/users';
import OwnerDashboard from './components/owner/dashboard-component/dashboard';
// import AddWarehouses from './components/owner/warehouses-component/warehouses-add/warehouses-add';
import OwnerItems from './components/owner/items-component/items';
import { SignUp } from './components/sign-up-components/sign-up-component/sign-up';
import { SignUpDetails } from './components/sign-up-components/sign-up-details-component/sign-up-details';
import Profile from './components/profile-component/profile';
import OwnerProfile from './components/profile-component/profile';
import OwnerWarehouses from './components/owner/warehouses-component/warehouses';
// import WarehousesAdd from './components/owner/warehouses-component/warehouses-add/warehouses-add';
import { AdminDashboardLayout } from './components/admin/dashboard-layout-component/dashboard-layout';
import AdminWarehouses from './components/admin/warehouses-component/warehouses';
import AdminVendors from './components/admin/vendors-component/vendors';
import AdminUsers from './components/admin/users-component/users';
import AdminCompanies from './components/admin/companies-component/companies';
import AdminTransport from './components/admin/transport-component/transport';
import AdminOrders from './components/admin/orders-component/orders';
import AdminRacks from './components/admin/racks-component/racks';
import AdminProducts from './components/admin/items-component/items';
import { ErrorProvider } from './components/result-handler-component/error-component/error-context';
import { LoadingProvider } from './components/loading-component/loading';
import Vendors from './components/vendor/vendors-component/vendors';
import VendorOrders from './components/orders-component/orders';
import { VendorLayout } from './components/vendor/vendor-layout-component/vendor-layout';

import AddOrderModal from './components/vendor/vendor-orders-component/create-order-component/create-order';
import CreateOrder from './components/vendor/vendor-orders-component/create-order-component/create-order';
import WarehouseDetail from './components/owner/warehouses-component/warehouse-detail-component/warehouse-detail';
import SupervisorWarehouses from './components/supervisor/warehouses-component/warehouses';
import SupervisorRequests from './components/supervisor/requests-component/requests';
import { SupervisorLayout } from './components/supervisor/supervisor-layout-component/supervisor-layout';
import { ConfigProvider } from 'antd';
import { SuccessProvider } from './components/result-handler-component/success-component/success-context';
import { ResetPassword } from './components/reset-password-component/reset-password';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Segoe UI',
        },
      }}
    >
      <SuccessProvider>
        <ErrorProvider>
          <LoadingProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to="/sign-in" replace />} />
                <Route path="sign-in" element={<SignIn />} />
                <Route path="sign-up" element={<SignUp />} />
                <Route path="sign-up-details" element={<SignUpDetails />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="owner/*" element={<OwnerDashboardLayout />}>
                  <Route
                    index
                    element={<Navigate to="/owner/dashboard" replace />}
                  />
                  <Route path="dashboard" element={<OwnerDashboard />} />
                  <Route path="orders" element={<VendorOrders />} />
                  <Route path="users" element={<OwnerUsers />} />
                  <Route path="warehouses" element={<OwnerWarehouses />} />
                  <Route
                    path="warehouses/:warehouse_id"
                    element={<WarehouseDetail />}
                  />
                  <Route path="items" element={<OwnerItems />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="vendor/*" element={<VendorLayout />}>
                  <Route
                    index
                    element={<Navigate to="/vendor/vendors" replace />}
                  />
                  <Route path="vendors" element={<Vendors />} />
                  <Route path="orders" element={<VendorOrders />} />
                  <Route path="orders-add" element={<CreateOrder />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="supervisor/*" element={<SupervisorLayout />}>
                  <Route
                    index
                    element={<Navigate to="/supervisor/requests" replace />}
                  />
                  <Route
                    path="warehouses/:warehouse_id"
                    element={<SupervisorWarehouses />}
                  />
                  <Route path="requests" element={<SupervisorRequests />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="admin/*" element={<AdminDashboardLayout />}>
                  <Route
                    index
                    element={<Navigate to="/admin/companies" replace />}
                  />
                  <Route path="companies" element={<AdminCompanies />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="warehouses" element={<AdminWarehouses />} />
                  <Route path="vendors" element={<AdminVendors />} />
                  <Route path="transport" element={<AdminTransport />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="racks" element={<AdminRacks />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Routes>
            </Router>
          </LoadingProvider>
        </ErrorProvider>
      </SuccessProvider>
    </ConfigProvider>
  );
}
