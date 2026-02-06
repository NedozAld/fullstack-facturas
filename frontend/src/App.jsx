
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import ClienteCrud from './ClienteCrud';
import ProductoCrud from './ProductoCrud';
import VentasCheckout from './VentasCheckout';
import FacturasHistorial from './FacturasHistorial';

function App() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/productos" element={<ProductoCrud />} />
          <Route path="/clientes" element={<ClienteCrud />} />
          <Route path="/ventas" element={<VentasCheckout />} />
          <Route path="/ventas/historial" element={<FacturasHistorial />} />
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="*" element={<Navigate to="/productos" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
