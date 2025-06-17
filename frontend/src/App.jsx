import { BrowserRouter as Router } from 'react-router-dom';
import "./App.css";
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext.jsx';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
