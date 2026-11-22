import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import LoginPage from '../pages/auth/LoginPage';
import AuthCallbackPage from '../pages/auth/AuthCallbackPage';
import SelectRolePage from '../pages/auth/SelectRolePage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import AccountNotRegisteredPage from '../pages/auth/AccountNotRegisteredPage';
import RoleDashboardPage from '../pages/shared/RoleDashboardPage';
import ProgramManagementPage from '../pages/director/ProgramManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import ProgramEvaluationListPage from '../pages/shared/ProgramEvaluationListPage';
import ProgramEvaluationFormPage from '../pages/shared/ProgramEvaluationFormPage';
import HrEvaluationFormPage from '../pages/shared/HrEvaluationFormPage';
import KpiAssessmentPage from '../pages/shared/KpiAssessmentPage';
import LeaderboardPage from '../pages/shared/LeaderboardPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public & Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/account-not-registered" element={<AccountNotRegisteredPage />} />
        <Route path="/select-role" element={<SelectRolePage />} />
      </Route>

      {/* Protected Role Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route
            element={
              <DashboardLayout
                title="Dashboard Admin"
                navItems={[
                  { label: 'Dashboard', to: '/admin/dashboard' },
                  { label: 'Manajemen Pengguna', to: '/admin/users' },
                  { label: 'Manajemen Proker', to: '/admin/programs' },
                ]}
              />
            }
          >
            <Route path="/admin/dashboard" element={<RoleDashboardPage roleTitle="Admin" />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/programs" element={<ProgramManagementPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['C_LEVEL']} />}>
          <Route
            element={
              <DashboardLayout
                title="Dashboard C-Level"
                navItems={[
                  { label: 'Dashboard', to: '/c-level/dashboard' },
                  { label: 'Evaluasi Proker (SC)', to: '/c-level/evaluations/programs' },
                  { label: 'Evaluasi Staff', to: '/c-level/evaluations/hr' },
                ]}
              />
            }
          >
            <Route path="/c-level/dashboard" element={<RoleDashboardPage roleTitle="C-Level" />} />
            <Route path="/c-level/evaluations/programs" element={<ProgramEvaluationListPage basePath="/c-level/evaluations/programs" />} />
            <Route path="/c-level/evaluations/programs/:programId" element={<ProgramEvaluationFormPage />} />
            <Route path="/c-level/evaluations/hr" element={<HrEvaluationFormPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['STAFF']} />}>
          <Route
            element={
              <DashboardLayout
                title="Dashboard Staff"
                navItems={[
                  { label: 'Dashboard', to: '/staff/dashboard' },
                  { label: 'Evaluasi Staff', to: '/staff/evaluations/hr' },
                ]}
              />
            }
          >
            <Route path="/staff/dashboard" element={<RoleDashboardPage roleTitle="Staff" />} />
            <Route path="/staff/evaluations/hr" element={<HrEvaluationFormPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['KAPEL', 'WAKAPEL']} />}>
          <Route
            element={
              <DashboardLayout
                title="Dashboard OC (Kapel / Wakapel)"
                navItems={[
                  { label: 'Dashboard', to: '/oc/dashboard' },
                  { label: 'Evaluasi Proker (OC)', to: '/oc/evaluations/programs' },
                ]}
              />
            }
          >
            <Route path="/oc/dashboard" element={<RoleDashboardPage roleTitle="Organizing Committee" />} />
            <Route path="/oc/evaluations/programs" element={<ProgramEvaluationListPage basePath="/oc/evaluations/programs" />} />
            <Route path="/oc/evaluations/programs/:programId" element={<ProgramEvaluationFormPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['DIRECTOR']} />}>
          <Route
            element={
              <DashboardLayout
                title="Dashboard Director"
                navItems={[
                  { label: 'Dashboard', to: '/director/dashboard' },
                  { label: 'Manajemen Proker', to: '/director/programs' },
                  { label: 'Evaluasi Proker', to: '/director/evaluations/programs' },
                  { label: 'KPI Assessment', to: '/director/kpi' },
                  { label: 'Leaderboard', to: '/director/leaderboard' },
                ]}
              />
            }
          >
            <Route path="/director/dashboard" element={<RoleDashboardPage roleTitle="Director" />} />
            <Route path="/director/programs" element={<ProgramManagementPage />} />
            <Route path="/director/evaluations/programs" element={<ProgramEvaluationListPage basePath="/director/evaluations/programs" />} />
            <Route path="/director/evaluations/programs/:programId" element={<ProgramEvaluationFormPage />} />
            <Route path="/director/kpi" element={<KpiAssessmentPage />} />
            <Route path="/director/leaderboard" element={<LeaderboardPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['KD']} />}>
          <Route
            element={
              <DashboardLayout
                title="Dashboard KD"
                navItems={[
                  { label: 'Dashboard', to: '/kd/dashboard' },
                  { label: 'Penilaian KD', to: '/kd/assessments' },
                  { label: 'Leaderboard', to: '/kd/results' },
                ]}
              />
            }
          >
            <Route path="/kd/dashboard" element={<RoleDashboardPage roleTitle="KD" />} />
            <Route path="/kd/assessments" element={<KpiAssessmentPage />} />
            <Route path="/kd/results" element={<LeaderboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
