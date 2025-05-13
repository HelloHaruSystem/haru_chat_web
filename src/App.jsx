import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import AppRoutes from './routes/AppRoutes';
import AuthProvider from './context/AuthProvider';


function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
