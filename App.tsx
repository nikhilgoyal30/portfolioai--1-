
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PortfolioBuilderPage from './pages/PortfolioBuilderPage';
import CVGeneratorPage from './pages/CVGeneratorPage';
import CoverLetterWriterPage from './pages/CoverLetterWriterPage';
import MockInterviewPage from './pages/MockInterviewPage';
import JobAlertsPage from './pages/JobAlertsPage';
import CareerCoachingPage from './pages/CareerCoachingPage';

const App: React.FC = () => {
  // Simulate API key availability. In a real scenario, this would be handled securely.
  // For this exercise, we assume process.env.API_KEY is set in the environment.
  // We add a check here to remind the user, but the app will try to run.
  if (!process.env.API_KEY) {
    console.warn(
      "API_KEY environment variable is not set. Gemini API calls will fail. " +
      "Please ensure API_KEY is configured in your environment."
    );
  }
  
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/portfolio-builder" element={<PortfolioBuilderPage />} />
          <Route path="/cv-generator" element={<CVGeneratorPage />} />
          <Route path="/cover-letter-writer" element={<CoverLetterWriterPage />} />
          <Route path="/mock-interviewer" element={<MockInterviewPage />} />
          <Route path="/job-alerts" element={<JobAlertsPage />} />
          <Route path="/career-coaching" element={<CareerCoachingPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} /> {}
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
