/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WarehouseProvider, useWarehouse } from './context/WarehouseContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { SupersetVisualizerView } from './components/visualizer/SupersetVisualizerView';
import { DragDropReportBuilder } from './components/builder/DragDropReportBuilder';
import { OracleGatewayView } from './components/oracle/OracleGatewayView';
import { SqlWorkbench } from './components/sql/SqlWorkbench';
import { AlertsManager } from './components/alerts/AlertsManager';
import { ReportExporter } from './components/reports/ReportExporter';
import { ThirdPartyApiHub } from './components/api/ThirdPartyApiHub';
import { EmailAlertModal } from './components/alerts/EmailAlertModal';
import { DatasetStudio } from './components/datasets/DatasetStudio';
import { LoginView } from './components/auth/LoginView';
import { UserProfileView } from './components/profile/UserProfileView';

const AppContent: React.FC = () => {
  const { activeView, activeEmailModal, closeEmailModal, isAuthenticated } = useWarehouse();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Navigation */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        <Sidebar 
          mobileOpen={mobileSidebarOpen} 
          onCloseMobile={() => setMobileSidebarOpen(false)} 
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          {activeView === 'dashboard' && <OverviewDashboard />}
          {activeView === 'dataset_studio' && <DatasetStudio />}
          {activeView === 'visualizer' && <SupersetVisualizerView />}
          {activeView === 'builder' && <DragDropReportBuilder />}
          {activeView === 'oracle' && <OracleGatewayView />}
          {activeView === 'sql' && <SqlWorkbench />}
          {activeView === 'alerts' && <AlertsManager />}
          {activeView === 'reports' && <ReportExporter />}
          {activeView === 'api' && <ThirdPartyApiHub />}
          {activeView === 'profile' && <UserProfileView />}
        </main>
      </div>

      {/* Automated Incident Email Modal */}
      <EmailAlertModal 
        email={activeEmailModal} 
        onClose={closeEmailModal} 
      />
    </div>
  );
};

export default function App() {
  return (
    <WarehouseProvider>
      <AppContent />
    </WarehouseProvider>
  );
}
