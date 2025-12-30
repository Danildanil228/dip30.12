import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./Pages/Login";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from './components/ProtectedRoute';
import Main from './Pages/Main';
import Materials from './Pages/Materials';
import Profile from './Pages/Profile';
import Notifications from './Pages/Notifications';
import AdminRoute from './components/AdminRoute';
import AllUsers from './Pages/AllUsers';
import AddUser from './Pages/AddUser';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            {/* Защищенные маршруты для всех авторизованных */}
            <Route path="/main" element={
              <ProtectedRoute>
                <Main />
              </ProtectedRoute>
            } />

            <Route path="/materials" element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />

            {/* Маршруты только для админов */}
            <Route path="/allusers" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AllUsers />
                </AdminRoute>
              </ProtectedRoute>
            } />

            <Route path="/add" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AddUser />
                </AdminRoute>
              </ProtectedRoute>
            } />
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
