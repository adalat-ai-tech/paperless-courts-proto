import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { useAppStore } from './store';

// Pages
import LoginPage from './pages/LoginPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import DashboardPage from './pages/DashboardPage';
import MyPermissionsPage from './pages/MyPermissionsPage';

// Case files
import CaseFilesListPage from './pages/case-files/CaseFilesListPage';
import CaseFilePage from './pages/case-files/CaseFilePage';

// Filing
import FilingQueuePage from './pages/filing/FilingQueuePage';
import NewFilingPage from './pages/filing/NewFilingPage';
import CaseLookupPage from './pages/filing/CaseLookupPage';
import FilingCasePage from './pages/filing/FilingCasePage';

// Preparation
import PreparationQueuePage from './pages/preparation/PreparationQueuePage';
import PreparationCompletedPage from './pages/preparation/PreparationCompletedPage';
import PreparationCasePage from './pages/preparation/PreparationCasePage';

// Scrutiny
import ScrutinyQueuePage from './pages/scrutiny/ScrutinyQueuePage';
import ScrutinyCasePage from './pages/scrutiny/ScrutinyCasePage';

// Defect cure
import DefectCureQueuePage from './pages/defect-cure/DefectCureQueuePage';
import DefectCureCasePage from './pages/defect-cure/DefectCureCasePage';
import DefectCureCaseEditPage from './pages/defect-cure/DefectCureCaseEditPage';

// Scanning
import ScanningCaseLookupPage from './pages/scanning/ScanningCaseLookupPage';
import ScanningCompletedPage from './pages/scanning/ScanningCompletedPage';
import ScanningCasePage from './pages/scanning/ScanningCasePage';

// Admin
import StaffPage from './pages/admin/StaffPage';
import RolesPage from './pages/admin/RolesPage';
import SettingsPage from './pages/admin/SettingsPage';
import ChecklistsPage from './pages/admin/ChecklistsPage';

// Audit
import AuditLogPage from './pages/audit/AuditLogPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAppStore(s => s.currentUser);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        <Route element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-permissions" element={<MyPermissionsPage />} />

          {/* Case Register */}
          <Route path="/case-files" element={<CaseFilesListPage />} />
          <Route path="/case-files/:caseId" element={<CaseFilePage />} />

          {/* Filing Desk */}
          <Route path="/filing-desk/queue" element={<FilingQueuePage />} />
          <Route path="/filing-desk/new" element={<NewFilingPage />} />
          <Route path="/filing-desk/case-lookup" element={<CaseLookupPage />} />
          <Route path="/filing-desk/cases/:caseId" element={<FilingCasePage />} />

          {/* Preparation */}
          <Route path="/preparation/queue" element={<PreparationQueuePage />} />
          <Route path="/preparation/completed" element={<PreparationCompletedPage />} />
          <Route path="/preparation/cases/:caseId" element={<PreparationCasePage />} />

          {/* Scrutiny */}
          <Route path="/scrutiny/queue" element={<ScrutinyQueuePage />} />
          <Route path="/scrutiny/cases/:caseId" element={<ScrutinyCasePage />} />

          {/* Defect Cure */}
          <Route path="/defect-cure/queue" element={<DefectCureQueuePage />} />
          <Route path="/defect-cure/cases/:caseId" element={<DefectCureCasePage />} />
          <Route path="/defect-cure/cases/:caseId/edit" element={<DefectCureCaseEditPage />} />

          {/* Scanning */}
          <Route path="/scanning/case-lookup" element={<ScanningCaseLookupPage />} />
          <Route path="/scanning/completed" element={<ScanningCompletedPage />} />
          <Route path="/scanning/cases/:id" element={<ScanningCasePage />} />

          {/* Admin */}
          <Route path="/admin/staff" element={<StaffPage />} />
          <Route path="/admin/roles" element={<RolesPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/checklists" element={<ChecklistsPage />} />

          {/* Audit */}
          <Route path="/audit" element={<AuditLogPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
