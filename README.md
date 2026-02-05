# Proyecto Full Stack: API REST-REQUENEP

## Tecnologías Utilizadas

### Backend
- **Lenguaje:** JavaScript (Node.js)
- **Framework:** Express.js
- **ORM:** Sequelize
- **Base de datos:** PostgreSQL
- **Gestor de dependencias:** npm

### Frontend
- **Framework:** React
- **Herramienta de desarrollo:** Vite
- **Librerías UI:** Bootstrap, FontAwesome, Animate.css
- **Gestor de dependencias:** npm

---

## Instrucciones de Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/NedozAld/fullstack-facturas.git
cd fullstack-facturas
```

### 2. Backend

#### Instalación de dependencias
```bash
cd backend
npm install
```

#### Configuración de la base de datos
- Edita el archivo de configuración de Sequelize para poner tus credenciales de PostgreSQL.
- Asegúrate de tener una base de datos PostgreSQL creada.

#### Ejecución del servidor
```bash
npm start
```
El backend se ejecutará normalmente en `http://localhost:3000`.

### 3. Frontend

#### Instalación de dependencias
```bash
cd ../frontend
npm install
```

#### Ejecución de la aplicación
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

---

## Notas
- Asegúrate de que el backend esté corriendo antes de usar el frontend.
- El frontend consume la API REST expuesta por el backend.
- Puedes modificar las variables de entorno y configuraciones según tus necesidades.

---

**Autor:** Tu Nombre
