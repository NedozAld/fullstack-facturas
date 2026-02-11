
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/login', {
                username,
                password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Error al iniciar sesión. Verifique la conexión.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />

            <div style={{
                minHeight: '100vh',
                background: '#f5f7fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <Card style={{
                        border: '1px solid #e1e8ed',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        background: 'white'
                    }}>
                        <Card.Body style={{ padding: '48px 40px' }}>
                            {/* Simple header */}
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    margin: '0 auto 16px',
                                    background: '#f0f4f8',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <i className="fas fa-receipt" style={{
                                        fontSize: '1.5rem',
                                        color: '#4a5568'
                                    }}></i>
                                </div>
                                <h2 style={{
                                    color: '#1a202c',
                                    fontWeight: '600',
                                    fontSize: '1.5rem',
                                    marginBottom: '6px',
                                    letterSpacing: '-0.02em'
                                }}>Iniciar Sesión</h2>
                                <p style={{
                                    color: '#718096',
                                    fontSize: '0.9rem',
                                    margin: 0
                                }}>Sistema de Facturación</p>
                            </div>

                            {error && (
                                <Alert
                                    variant="danger"
                                    dismissible
                                    onClose={() => setError('')}
                                    style={{
                                        borderRadius: '6px',
                                        border: '1px solid #fc8181',
                                        background: '#fff5f5',
                                        color: '#c53030',
                                        marginBottom: '24px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <i className="fas fa-exclamation-circle me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{
                                        fontWeight: '500',
                                        fontSize: '0.875rem',
                                        color: '#4a5568',
                                        marginBottom: '8px'
                                    }}>
                                        Usuario
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingrese su usuario"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.95rem',
                                            transition: 'border-color 0.15s ease',
                                            background: 'white'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#4299e1';
                                            e.target.style.outline = 'none';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label style={{
                                        fontWeight: '500',
                                        fontSize: '0.875rem',
                                        color: '#4a5568',
                                        marginBottom: '8px'
                                    }}>
                                        Contraseña
                                    </Form.Label>
                                    <div style={{ position: 'relative' }}>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Ingrese su contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{
                                                padding: '12px 45px 12px 16px',
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '0.95rem',
                                                transition: 'border-color 0.15s ease',
                                                background: 'white'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#4299e1';
                                                e.target.style.outline = 'none';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e2e8f0';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                color: '#a0aec0',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                transition: 'color 0.15s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = '#4a5568'}
                                            onMouseLeave={(e) => e.target.style.color = '#a0aec0'}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '1rem' }}></i>
                                        </button>
                                    </div>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: '#3182ce',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        marginTop: '8px',
                                        transition: 'background-color 0.15s ease',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) e.target.style.background = '#2c5aa0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = '#3182ce';
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Verificando...
                                        </>
                                    ) : (
                                        'Iniciar Sesión'
                                    )}
                                </Button>
                            </Form>

                            <div style={{
                                textAlign: 'center',
                                marginTop: '24px',
                                paddingTop: '20px',
                                borderTop: '1px solid #e2e8f0'
                            }}>
                                <p style={{
                                    color: '#a0aec0',
                                    fontSize: '0.8rem',
                                    margin: 0
                                }}>
                                    <i className="fas fa-lock me-1" style={{ fontSize: '0.75rem' }}></i>
                                    Conexión segura
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Login;
