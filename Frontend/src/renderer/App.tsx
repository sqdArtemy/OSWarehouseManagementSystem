import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { SignIn } from './components/sign-in-component/sign-in';
import { DashboardLayout } from './components/owner/dashboard-layout-component/dashboard-layout';
import './App.css';
import './normalize.css';
import Users from './components/owner/users-component/users';
import Dashboard from './components/owner/dashboard-component/dashboard';
// import AddWarehouses from './components/owner/warehouses-component/warehouses-add/warehouses-add';
import Items from './components/owner/items-component/items';
import { SignUp } from './components/sign-up-components/sign-up-component/sign-up';
import { SignUpDetails } from './components/sign-up-components/sign-up-details-component/sign-up-details';
import Profile from './components/owner/profile-component/profile';
import Warehouses from './components/owner/warehouses-component/warehouses';
// import WarehousesAdd from './components/owner/warehouses-component/warehouses-add/warehouses-add';
import { ErrorProvider } from './components/error-component/error-context';
import Vendors from './components/vendor/vendors-component/vendors';
import VendorOrders from './components/vendor/vendor-orders-component/vendor-orders';
import { VendorLayout } from './components/vendor/vendor-layout-component/vendor-layout';

export default function App() {
  return (
    <ErrorProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/sign-in" replace />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="sign-up-details" element={<SignUpDetails />} />
          <Route path="owner/*" element={<DashboardLayout />}>
            <Route
              path="./"
              element={<Navigate to="/owner/dashboard" replace />}
            />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="items" element={<Items />} />
            <Route path="profile" element={<Profile />} />
            {/*<Route path="warehouses-add" element={<WarehousesAdd />} />*/}
          </Route>
          <Route path="vendor/*" element={<VendorLayout />}>
            <Route
              path="./"
              element={<Navigate to="/vendor/vendors" replace />}
            />
            <Route path="vendors" element={<Vendors />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="profile" element={<Profile />} />
            {/*<Route path="warehouses-add" element={<WarehousesAdd />} />*/}
          </Route>
        </Routes>
      </Router>
    </ErrorProvider>
  );
}
