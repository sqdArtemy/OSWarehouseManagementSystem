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
import OwnerProfile from './components/owner/profile-component/profile';
import OwnerWarehouses from './components/owner/warehouses-component/warehouses';
// import WarehousesAdd from './components/owner/warehouses-component/warehouses-add/warehouses-add';
import { AdminDashboardLayout } from './components/admin/dashboard-layout-component/dashboard-layout';
import AdminProfile from './components/admin/profile-component/profile';
import AdminWarehouses from './components/admin/warehouses-component/warehouses';
import AdminVendors from './components/admin/vendor-component/vendor';
import AdminUsers from './components/admin/users-component/users';
import AdminCompanies from './components/admin/companies-component/companies';
import AdminTransport from './components/admin/transport-component/transport';
import AdminOrders from './components/admin/orders-component/orders';
import AdminRacks from './components/admin/racks-component/racks'
import { ErrorProvider } from './components/error-component/error-context';
import { LoadingProvider } from './components/loading-component/loading';
import Vendors from './components/vendor/vendors-component/vendors';
import VendorOrders from './components/vendor/vendor-orders-component/vendor-orders';
import { VendorLayout } from './components/vendor/vendor-layout-component/vendor-layout';


export default function App() {
  return (
    <ErrorProvider>
      <LoadingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/companies" replace />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="sign-up-details" element={<SignUpDetails />} />
          <Route path="owner/*" element={<OwnerDashboardLayout />}>
            <Route
              path="./"
              element={<Navigate to="/owner/dashboard" replace />}
            />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="users" element={<OwnerUsers />} />
            <Route path="warehouses" element={<OwnerWarehouses />} />
            <Route path="items" element={<OwnerItems />} />
            {/*<Route path="warehouses-add" element={<WarehousesAdd />} />*/}
            <Route path="profile" element={<OwnerProfile />} />
          </Route>
          <Route path="admin/*" element={<AdminDashboardLayout />}>
            <Route
              path="./"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="warehouses" element={<AdminWarehouses />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="transport" element={<AdminTransport />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="racks" element={<AdminRacks />} />
          </Route>
          <Route path="vendor/*" element={<VendorLayout />}>
            <Route
              path="./"
              element={<Navigate to="/vendor/vendors" replace />}
            />
            <Route path="vendors" element={<Vendors />} />
            <Route path="orders" element={<VendorOrders />} />
            {/* <Route path="profile" element={<Profile />} /> */}
            {/*<Route path="warehouses-add" element={<WarehousesAdd />} />*/}
          </Route>
        </Routes>
      </Router>
      </LoadingProvider>
    </ErrorProvider>
  );
}
