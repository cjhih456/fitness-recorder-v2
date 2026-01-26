// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { GraphQLSQLiteWorkerProvider } from '@fitness-recoder/graphql-sqlite-worker';
import DbWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/dbWorker?worker&url';
import ServiceWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/serviceWorker?worker&url';
import { ThemeProvider } from 'next-themes';
import { Route, Routes } from 'react-router-dom';
import DefaultLayout from '../components/layout/DefaultLayout';
import SuspenseBoundary from '../components/utils/SuspenseBoundary';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Routines from './pages/Routines';
import Workout from './pages/Workout';

export function App() {
  return (
    <ThemeProvider defaultTheme="light" enableSystem={false} attribute="class">
      <DefaultLayout>
        <SuspenseBoundary fallback={<div>Loading...</div>}>
          <GraphQLSQLiteWorkerProvider
            workerConfig={{ dbName: 'fitness.db', appVersion: '1.3.0', dbWorkerUrl: DbWorkerUrl }}
            serviceWorkerUrl={ServiceWorkerUrl}
          >
            <SuspenseBoundary fallback={<div>Loading Data...</div>}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/routines" element={<Routines />} />
                <Route path="/workout/:scheduleId" element={<Workout />} />
              </Routes>
            </SuspenseBoundary>
          </GraphQLSQLiteWorkerProvider>
        </SuspenseBoundary>
      </DefaultLayout>
    </ThemeProvider>
  );
}

export default App;