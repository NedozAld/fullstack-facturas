import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from './apiUsuario';
import { getClientes } from './apiFactura'; // To optionally link to a client

const initialForm = {
    usu_username: '',
    usu_password: '',
    usu_rol: 'cliente',
    cli_id: ''
};

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [resUsuarios, resClientes] = await Promise.all([
                    getUsuarios(),
                    getClientes()
                ]);
                setUsuarios(resUsuarios.data);
                setClientes(resClientes.data);
            } catch (error) {
                console.error('Error al cargar datos', error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [resUsuarios, resClientes] = await Promise.all([
                getUsuarios(),
                getClientes()
            ]);
            setUsuarios(resUsuarios.data);
            setClientes(resClientes.data);
        } catch (error) {
            console.error('Error al cargar datos', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSave = {
                ...form,
                cli_id: form.cli_id || null // Ensure null if empty string
            };

            if (editId) {
                await updateUsuario(editId, dataToSave);
            } else {
                await createUsuario(dataToSave);
            }
            setShowModal(false);
            setForm(initialForm);
            setEditId(null);
            loadData();
        } catch (error) {
            console.error('Error al guardar usuario', error);
            alert('Error al guardar usuario. Verifique si el usuario ya existe.');
        }
        setLoading(false);
    };

    const handleEdit = (usuario) => {
        setForm({
            usu_username: usuario.usu_username,
            usu_password: usuario.usu_password, // Taking plain text for now as per model
            usu_rol: usuario.usu_rol || 'cliente',
            cli_id: usuario.cli_id || ''
        });
        setEditId(usuario.usu_id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
        setLoading(true);
        try {
            await deleteUsuario(id);
            loadData();
        } catch (error) {
            console.error('Error al eliminar usuario', error);
        }
        setLoading(false);
    };

    const getRoleBadge = (rol) => {
        switch (rol) {
            case 'admin': return <Badge bg="purple" style={{ backgroundColor: '#805ad5' }}>Administrador</Badge>;
            case 'cliente': return <Badge bg="info" text="dark">Cliente</Badge>;
            default: return <Badge bg="secondary">{rol}</Badge>;
        }
    };

    const filteredUsuarios = usuarios.filter(u =>
        u.usu_username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container fluid className="py-4 animate__animated animate__fadeIn">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-0"><i className="fas fa-users-cog text-primary me-2"></i>Gestión de Usuarios</h4>
                    <p className="text-muted mb-0 small">Administra el acceso y roles del sistema.</p>
                </div>
                <Button variant="primary" className="rounded-pill px-4 shadow-sm fw-bold" onClick={() => { setShowModal(true); setForm(initialForm); setEditId(null); }}>
                    <i className="fas fa-user-plus me-2"></i> Nuevo Usuario
                </Button>
            </div>

            <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
                <Card.Header className="bg-white py-3 border-bottom">
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-light border-end-0 border">
                            <i className="fas fa-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 bg-light border"
                            placeholder="Buscar usuario..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </Card.Header>
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light text-secondary small text-uppercase">
                        <tr>
                            <th className="border-0 py-3 ps-4">Usuario</th>
                            <th className="border-0 py-3">Rol</th>
                            <th className="border-0 py-3">Cliente Asociado</th>
                            <th className="border-0 py-3 text-end pe-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsuarios.map(u => (
                            <tr key={u.usu_id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <div className={`avatar-small me-3 text-white rounded-circle d-flex align-items-center justify-content-center ${u.usu_rol === 'admin' ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '35px', height: '35px' }}>
                                            {u.usu_username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{u.usu_username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{getRoleBadge(u.usu_rol)}</td>
                                <td>
                                    {u.Cliente ? (
                                        <span className="text-muted small"><i className="fas fa-user-tag me-1"></i>{u.Cliente.cli_nombre}</span>
                                    ) : <span className="text-muted small">-</span>}
                                </td>
                                <td className="text-end pe-4">
                                    <Button variant="link" className="text-warning p-0 me-3" onClick={() => handleEdit(u)} title="Editar"><i className="fas fa-edit"></i></Button>
                                    <Button variant="link" className="text-danger p-0" onClick={() => handleDelete(u.usu_id)} title="Eliminar"><i className="fas fa-trash"></i></Button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsuarios.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-5 text-muted">No se encontraron usuarios.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Modal Crear/Editar */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold text-dark h5">
                        <i className={`fas ${editId ? 'fa-user-edit' : 'fa-user-plus'} text-primary me-2`}></i>
                        {editId ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="pt-0">
                        <div className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Nombre de Usuario <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="usu_username"
                                required
                                value={form.usu_username}
                                onChange={handleChange}
                                placeholder="Ej: admin"
                            />
                        </div>
                        <div className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Contraseña <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text" // Using text to see password as per typical simple internal apps, or password type
                                name="usu_password"
                                required
                                value={form.usu_password}
                                onChange={handleChange}
                                placeholder="Ingrese contraseña"
                            />
                        </div>
                        <div className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Rol <span className="text-danger">*</span></Form.Label>
                            <Form.Select name="usu_rol" value={form.usu_rol} onChange={handleChange} required>
                                <option value="cliente">Cliente</option>
                                <option value="admin">Administrador</option>
                            </Form.Select>
                        </div>
                        <div className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Asociar a Cliente (Opcional)</Form.Label>
                            <Form.Select name="cli_id" value={form.cli_id} onChange={handleChange}>
                                <option value="">-- Ninguno --</option>
                                {clientes.map(c => (
                                    <option key={c.cli_id} value={c.cli_id}>{c.cli_nombre}</option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-muted small">
                                Si el rol es 'Cliente', es recomendable asociarlo a un registro de cliente.
                            </Form.Text>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4 fw-bold border">Cancelar</Button>
                        <Button variant="primary" type="submit" className="rounded-pill px-4 fw-bold shadow-sm">
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Usuarios;
