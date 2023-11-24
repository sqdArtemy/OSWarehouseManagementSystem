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
import AdminItems from './components/admin/items-component/items';
import AdminUsers from './components/admin/users-component/users';
import AdminDashboard from './components/admin/dashboard-component/dashboard';
import AdminAddWarehouses from './components/admin/warehouses-component/add-warehouse-component/add-warehouse';
import { ErrorProvider } from './components/error-component/error-context';

export default function App() {
  return (
    <ErrorProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
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
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="warehouses" element={<AdminWarehouses />} />
            <Route path="items" element={<AdminItems />} />
            {/*<Route path="warehouses-add" element={<AdminAddWarehouse />} />*/}
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </Router>
    </ErrorProvider>
  );
}
