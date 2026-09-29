import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { RoleRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagePatients from './pages/admin/ManagePatients';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageNurses from './pages/admin/ManageNurses';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageMedicines from './pages/admin/ManageMedicines';
import ManageBilling from './pages/admin/ManageBilling';
import Reports from './pages/admin/Reports';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';

// Nurse pages
import NurseDashboard from './pages/nurse/NurseDashboard';
import NursePatients from './pages/nurse/NursePatients';
import NurseAppointments from './pages/nurse/NurseAppointments';
import NurseVitals from './pages/nurse/NurseVitals';
import NurseNotes from './pages/nurse/NurseNotes';

// Receptionist pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import RegisterPatient from './pages/receptionist/RegisterPatient';
import PatientList from './pages/receptionist/PatientList';
import ScheduleAppointment from './pages/receptionist/ScheduleAppointment';
import RecAppointments from './pages/receptionist/RecAppointments';
import RecBilling from './pages/receptionist/RecBilling';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import FindDoctor from './pages/patient/FindDoctor';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import Prescriptions from './pages/patient/Prescriptions';
import Bills from './pages/patient/Bills';
import Notifications from './pages/patient/Notifications';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin routes */}
          <Route path="/admin" element={<RoleRoute roles={['admin']}><DashboardLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="patients" element={<ManagePatients />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="nurses" element={<ManageNurses />} />
            <Route path="departments" element={<ManageDepartments />} />
            <Route path="appointments" element={<ManageAppointments />} />
            <Route path="medicines" element={<ManageMedicines />} />
            <Route path="billing" element={<ManageBilling />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Doctor routes */}
          <Route path="/doctor" element={<RoleRoute roles={['doctor']}><DashboardLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="medical-records" element={<DoctorMedicalRecords />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
          </Route>

          {/* Nurse routes */}
          <Route path="/nurse" element={<RoleRoute roles={['nurse']}><DashboardLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<NurseDashboard />} />
            <Route path="patients" element={<NursePatients />} />
            <Route path="appointments" element={<NurseAppointments />} />
            <Route path="vitals" element={<NurseVitals />} />
            <Route path="notes" element={<NurseNotes />} />
          </Route>

          {/* Receptionist routes */}
          <Route path="/receptionist" element={<RoleRoute roles={['receptionist']}><DashboardLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ReceptionistDashboard />} />
            <Route path="register-patient" element={<RegisterPatient />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="schedule" element={<ScheduleAppointment />} />
            <Route path="appointments" element={<RecAppointments />} />
            <Route path="billing" element={<RecBilling />} />
          </Route>

          {/* Patient routes */}
          <Route path="/patient" element={<RoleRoute roles={['patient']}><DashboardLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="find-doctor" element={<FindDoctor />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="medical-records" element={<MedicalRecords />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="bills" element={<Bills />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
