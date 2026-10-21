import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'

const contenedor = document.getElementById('root')
const raiz = createRoot(contenedor)

// HashRouter mantiene las URLs con "#/" (#/torneos, #/detalle-torneo?id=1, ...) igual que
// la versión anterior, y funciona al abrir el build desde cualquier hosting estático.
raiz.render(
    <StrictMode>
        <HashRouter>
            <AppProvider>
                <App />
            </AppProvider>
        </HashRouter>
    </StrictMode>
)
