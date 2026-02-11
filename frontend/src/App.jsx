
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ClienteCrud from './ClienteCrud';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={
            <div className="App">
              <h1>Gestión de Clientes</h1>
              <ClienteCrud />
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                style={{ marginTop: '20px', backgroundColor: '#f44336' }}
              >
                Cerrar Sesión
              </button>
            </div>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
