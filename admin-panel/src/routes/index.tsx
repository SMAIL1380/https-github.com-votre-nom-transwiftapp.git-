import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import DriverRegistrationsList from '../pages/driver-registrations/DriverRegistrationsList';
import ActiveDriversList from '../pages/drivers/ActiveDriversList';
import UsersList from '../pages/users/UsersList';
import DeliveriesList from '../pages/deliveries/DeliveriesList';
import Settings from '../pages/settings/Settings';
import Layout from '../components/Layout';
import PrivateRoute from './PrivateRoute';
import DriverList from '../screens/drivers/DriverList';
import CustomerList from '../screens/customers/CustomerList';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PrivateRoute component={Dashboard} />} />
        <Route
          path="/drivers/registrations"
          element={<PrivateRoute component={DriverRegistrationsList} />}
        />
        <Route
          path="/drivers/active"
          element={<PrivateRoute component={ActiveDriversList} />}
        />
        <Route
          path="/drivers/manage"
          element={<PrivateRoute component={DriverList} />}
        />
        <Route
          path="/customers"
          element={<PrivateRoute component={CustomerList} />}
        />
        <Route path="/users" element={<PrivateRoute component={UsersList} />} />
        <Route
          path="/deliveries"
          element={<PrivateRoute component={DeliveriesList} />}
        />
        <Route path="/settings" element={<PrivateRoute component={Settings} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
