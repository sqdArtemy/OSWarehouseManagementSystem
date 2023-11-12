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
import Warehouses from './components/owner/warehouses-component/warehouses';
import Items from './components/owner/items-component/items';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="sign-in" replace />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="owner/*" element={<DashboardLayout />}>
          <Route
            path="./"
            element={<Navigate to="/owner/dashboard" replace />}
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="items" element={<Items />} />
        </Route>
      </Routes>
    </Router>
  );
}
