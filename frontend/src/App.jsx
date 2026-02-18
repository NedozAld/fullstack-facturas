
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import Login from './Login';
import Dashboard from './Dashboard';
import ClienteCrud from './ClienteCrud';
import Productos from './Productos';
import Facturas from './Facturas';
import Usuarios from './Usuarios';
import ProtectedRoute from './ProtectedRoute';

function App() {
  console.log('App component mounting...');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />


        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />}>
            <Route index element={<ClienteCrud />} />
            <Route path="productos" element={<Productos />} />
            <Route path="facturas" element={<Facturas />} />


            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="usuarios" element={<Usuarios />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
