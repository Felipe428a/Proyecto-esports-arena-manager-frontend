import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider'
import { AppProvider } from './context/AppContext'

// AuthProvider envuelve todo: cualquier componente puede usar useAuth().
// BrowserRouter usa URLs limpias (/torneos/1); en Vercel, vercel.json responde index.html en toda ruta.
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <AppProvider>
                    <App />
                </AppProvider>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
)
