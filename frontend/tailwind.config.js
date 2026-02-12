/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5', // Indigo Vibrante
                secondary: '#10B981', // Verde Esmeralda
                background: '#F9FAFB', // Gris casi blanco
                surface: '#FFFFFF', // Blanco puro
                text: '#111827', // Casi negro
                accent: '#F59E0B', // Ámbar
                error: '#EF4444', // Rojo
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
