import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomNavigation from './components/BottomNavigation'
import AiAssistant from './components/AiAssistant'
import { AdminProtectedRoute, ProviderProtectedRoute, UserProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Categories from './pages/Categories'
import Subcategories from './pages/Subcategories'
import Hospitals from './pages/Hospitals'
import HospitalRoles from './pages/HospitalRoles'
import HospitalSpecializations from './pages/HospitalSpecializations'
import Schools from './pages/Schools'
import SchoolRoles from './pages/SchoolRoles'
import SchoolSubcategories from './pages/SchoolSubcategories'
import GovernmentOffices from './pages/GovernmentOffices'
import GovernmentServices from './pages/GovernmentServices'
import GovernmentRoles from './pages/GovernmentRoles'
import GovernmentProviders from './pages/GovernmentProviders'
import BusinessServices from './pages/BusinessServices'
import BusinessRoles from './pages/BusinessRoles'
import BusinessProviders from './pages/BusinessProviders'
import PublicRepresentatives from './pages/PublicRepresentatives'
import PublicRepresentativeOffices from './pages/PublicRepresentativeOffices'
import PublicRepresentativeProviders from './pages/PublicRepresentativeProviders'
import Entertainment from './pages/Entertainment'
import EntertainmentServices from './pages/EntertainmentServices'
import EntertainmentProviders from './pages/EntertainmentProviders'
import Providers from './pages/Providers'
import ProviderDetails from './pages/ProviderDetails'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import Profile from './pages/Profile'
import RescheduleAppointment from './pages/RescheduleAppointment'
import ProviderLogin from './pages/ProviderLogin'
import ProviderDashboard from './pages/ProviderDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AddSchedule from './pages/AddSchedule'
import NotFound from './pages/NotFound'

function App() {
  const isUserLoggedIn = () =>
    Boolean(
      localStorage.getItem('userId') ||
        localStorage.getItem('userEmail') ||
        localStorage.getItem('userName') ||
        localStorage.getItem('user') ||
        localStorage.getItem('token'),
    )

  return (
    <BrowserRouter basename="/app">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isUserLoggedIn() ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={isUserLoggedIn() ? <Navigate to="/home" replace /> : <Register />} />

        <Route path="/home" element={<UserProtectedRoute><Home /></UserProtectedRoute>} />
        <Route path="/categories" element={<UserProtectedRoute><Categories /></UserProtectedRoute>} />
        <Route path="/subcategories" element={<UserProtectedRoute><Subcategories /></UserProtectedRoute>} />
        <Route path="/hospitals" element={<UserProtectedRoute><Hospitals /></UserProtectedRoute>} />
        <Route path="/hospital-roles" element={<UserProtectedRoute><HospitalRoles /></UserProtectedRoute>} />
        <Route path="/hospital-specializations" element={<UserProtectedRoute><HospitalSpecializations /></UserProtectedRoute>} />
        <Route path="/schools" element={<UserProtectedRoute><Schools /></UserProtectedRoute>} />
        <Route path="/school-roles" element={<UserProtectedRoute><SchoolRoles /></UserProtectedRoute>} />
        <Route path="/school-subcategories" element={<UserProtectedRoute><SchoolSubcategories /></UserProtectedRoute>} />
        <Route path="/school-providers" element={<UserProtectedRoute><Providers /></UserProtectedRoute>} />
        <Route path="/government-offices" element={<UserProtectedRoute><GovernmentOffices /></UserProtectedRoute>} />
        <Route path="/government-services" element={<UserProtectedRoute><GovernmentServices /></UserProtectedRoute>} />
        <Route path="/government-roles" element={<UserProtectedRoute><GovernmentRoles /></UserProtectedRoute>} />
        <Route path="/government-providers" element={<UserProtectedRoute><GovernmentProviders /></UserProtectedRoute>} />
        <Route path="/business-services" element={<UserProtectedRoute><BusinessServices /></UserProtectedRoute>} />
        <Route path="/business-roles" element={<UserProtectedRoute><BusinessRoles /></UserProtectedRoute>} />
        <Route path="/business-providers" element={<UserProtectedRoute><BusinessProviders /></UserProtectedRoute>} />
        <Route path="/public-representatives" element={<UserProtectedRoute><PublicRepresentatives /></UserProtectedRoute>} />
        <Route path="/public-representative-offices" element={<UserProtectedRoute><PublicRepresentativeOffices /></UserProtectedRoute>} />
        <Route path="/public-representative-providers" element={<UserProtectedRoute><PublicRepresentativeProviders /></UserProtectedRoute>} />
        <Route path="/entertainment" element={<UserProtectedRoute><Entertainment /></UserProtectedRoute>} />
        <Route path="/entertainment-services" element={<UserProtectedRoute><EntertainmentServices /></UserProtectedRoute>} />
        <Route path="/entertainment-providers" element={<UserProtectedRoute><EntertainmentProviders /></UserProtectedRoute>} />
        <Route path="/providers" element={<UserProtectedRoute><Providers /></UserProtectedRoute>} />
        <Route path="/providers/:id" element={<UserProtectedRoute><ProviderDetails /></UserProtectedRoute>} />
        <Route path="/book/:providerId" element={<UserProtectedRoute><BookAppointment /></UserProtectedRoute>} />
        <Route path="/my-appointments" element={<UserProtectedRoute><MyAppointments /></UserProtectedRoute>} />
        <Route path="/bookings" element={<UserProtectedRoute><MyAppointments /></UserProtectedRoute>} />
        <Route path="/profile" element={<UserProtectedRoute><Profile /></UserProtectedRoute>} />
        <Route path="/reschedule/:id" element={<UserProtectedRoute><RescheduleAppointment /></UserProtectedRoute>} />

        <Route path="/provider-login" element={<ProviderLogin />} />
        <Route
          path="/provider-dashboard"
          element={
            <ProviderProtectedRoute>
              <ProviderDashboard />
            </ProviderProtectedRoute>
          }
        />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/providers"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route path="/add-schedule" element={<ProviderProtectedRoute><AddSchedule /></ProviderProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <AiAssistant />
      <BottomNavigation />
    </BrowserRouter>
  )
}

export default App
