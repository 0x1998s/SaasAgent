import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';

import AppLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AgentManagement from './pages/AgentManagement';
import LogisticsTracking from './pages/LogisticsTracking';
import EmailMarketing from './pages/EmailMarketing';
import DataAnalytics from './pages/DataAnalytics';
import WorkflowManagement from './pages/WorkflowManagement';
import Settings from './pages/Settings';

import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<AgentManagement />} />
          <Route path="/logistics" element={<LogisticsTracking />} />
          <Route path="/marketing" element={<EmailMarketing />} />
          <Route path="/analytics" element={<DataAnalytics />} />
          <Route path="/workflows" element={<WorkflowManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </div>
  );
};

export default App;
