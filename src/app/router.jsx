import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import QuestsPage from '../features/quests/QuestsPage';
import ShopPage from '../features/shop/ShopPage';
import MetricsPage from '../features/metrics/MetricsPage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import ReportsPage from '../features/reports/ReportsPage';
import SettingsPage from '../features/settings/SettingsPage';
import ProfilePage from '../features/profile/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/quests" replace /> },
      { path: 'quests', element: <QuestsPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'metrics', element: <MetricsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/quests" replace /> },
    ],
  },
]);
