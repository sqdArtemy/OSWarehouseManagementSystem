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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/owner/*" element={<DashboardLayout />}>
          <Route
            path="./"
            element={<Navigate to="/owner/dashboard" replace />}
          />
          {/*<Route path="/dashboard" element={<Dashboard />} />*/}
        </Route>
      </Routes>
    </Router>
  );
}
