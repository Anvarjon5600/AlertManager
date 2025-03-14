// import Footer from './Components/Footer/Footer'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home.tsx'
import Login from './pages/Login/Login.tsx'
import ProtectedRoute from './Routes/ProtectedRoute';

function App() {

  return (
    <div className="app-background">
      <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Home />} />
          </Route>
          <Route path='/login' element={<Login />} />
        </Routes>
    </div>
  )
}

export default App
