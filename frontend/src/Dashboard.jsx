
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Nav, Navbar, Button, Card } from 'react-bootstrap';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            {/* Sidebar */}
            <div style={{
                width: '260px',
                backgroundColor: '#2d3748',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
                padding: '20px'
            }}>
                <div className="mb-5 text-center">
                    <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#4299e1',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px'
                    }}>
                        <i className="fas fa-file-invoice-dollar" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                    </div>
                    <h5 className="mb-0" style={{ fontWeight: '600', letterSpacing: '0.5px' }}>FacturaApp</h5>
                </div>

                <Nav className="flex-column" style={{ gap: '10px' }}>
                    <Link to="/" className="text-decoration-none">
                        <div style={{
                            padding: '12px 15px',
                            borderRadius: '8px',
                            backgroundColor: isActive('/') ? '#4a5568' : 'transparent',
                            color: isActive('/') ? 'white' : '#a0aec0',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}>
                            <i className="fas fa-users me-3" style={{ width: '20px' }}></i>
                            <span style={{ fontWeight: '500' }}>Clientes</span>
                        </div>
                    </Link>

                    <Link to="/productos" className="text-decoration-none">
                        <div style={{
                            padding: '12px 15px',
                            borderRadius: '8px',
                            backgroundColor: isActive('/productos') ? '#4a5568' : 'transparent',
                            color: isActive('/productos') ? 'white' : '#a0aec0',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}>
                            <i className="fas fa-box me-3" style={{ width: '20px' }}></i>
                            <span style={{ fontWeight: '500' }}>Productos</span>
                        </div>
                    </Link>

                    <Link to="/facturas" className="text-decoration-none">
                        <div style={{
                            padding: '12px 15px',
                            borderRadius: '8px',
                            backgroundColor: isActive('/facturas') ? '#4a5568' : 'transparent',
                            color: isActive('/facturas') ? 'white' : '#a0aec0',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}>
                            <i className="fas fa-receipt me-3" style={{ width: '20px' }}></i>
                            <span style={{ fontWeight: '500' }}>Facturas</span>
                        </div>
                    </Link>

                    {user.rol === 'admin' && (
                        <Link to="/usuarios" className="text-decoration-none">
                            <div style={{
                                padding: '12px 15px',
                                borderRadius: '8px',
                                backgroundColor: isActive('/usuarios') ? '#4a5568' : 'transparent',
                                color: isActive('/usuarios') ? 'white' : '#a0aec0',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}>
                                <i className="fas fa-user-shield me-3" style={{ width: '20px' }}></i>
                                <span style={{ fontWeight: '500' }}>Admin. Usuarios</span>
                            </div>
                        </Link>
                    )}
                </Nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #4a5568', paddingTop: '20px' }}>
                    <div className="d-flex align-items-center mb-3 text-muted strong small">
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#4a5568',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '10px',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.username}
                        </div>
                    </div>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100"
                        onClick={handleLogout}
                        style={{ borderRadius: '6px' }}
                    >
                        <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                <Navbar bg="white" className="border-bottom px-4 py-3 sticky-top">
                    <Container fluid>
                        <Navbar.Brand className="fw-bold text-dark">
                            {isActive('/') && 'Gestión de Clientes'}
                            {isActive('/productos') && 'Inventario de Productos'}
                            {isActive('/facturas') && 'Historial de Facturas'}
                            {isActive('/usuarios') && 'Administración de Usuarios'}
                        </Navbar.Brand>
                    </Container>
                </Navbar>

                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
