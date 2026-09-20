import { GraphQLSQLiteWorkerProvider } from '@fitness-recoder/graphql-sqlite-worker';
import DbWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/dbWorker?worker&url';
import ServiceWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/serviceWorker?worker&url';
import { ThemeProvider } from 'next-themes';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import DefaultLayout from '../components/layout/DefaultLayout';
import PageLoadingSkeleton from '../components/utils/PageLoadingSkeleton';
import SuspenseBoundary from '../components/utils/SuspenseBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const History = lazy(() => import('./pages/History'));
const HistoryDetail = lazy(() => import('./pages/HistoryDetail'));
const Routines = lazy(() => import('./pages/Routines'));
const RoutineEdit = lazy(() => import('./pages/RoutineEdit'));
const Workout = lazy(() => import('./pages/Workout'));
const Photo = lazy(() => import('./pages/Photo'));

export function App() {
  return (
    <ThemeProvider defaultTheme="light" enableSystem={false} attribute="class">
      <SuspenseBoundary fallback={<PageLoadingSkeleton />}>
        <GraphQLSQLiteWorkerProvider
          workerConfig={{
            dbName: 'fitness.db',
            appVersion: '1.5.0',
            dbWorkerUrl: DbWorkerUrl,
          }}
          serviceWorkerUrl={ServiceWorkerUrl}
        >
          <DefaultLayout>
            <SuspenseBoundary fallback={<PageLoadingSkeleton />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route
                  path="/history/:scheduleId"
                  element={<HistoryDetail />}
                />
                <Route path="/routines" element={<Routines />} />
                <Route path="/routines/new" element={<RoutineEdit />} />
                <Route path="/routines/:id/edit" element={<RoutineEdit />} />
                <Route path="/workout/:scheduleId" element={<Workout />} />
                <Route path="/photo" element={<Photo />} />
              </Routes>
            </SuspenseBoundary>
          </DefaultLayout>
        </GraphQLSQLiteWorkerProvider>
      </SuspenseBoundary>
    </ThemeProvider>
  );
}

export default App;
