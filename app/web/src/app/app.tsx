// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { GraphQLSQLiteWorkerProvider } from '@fitness-recoder/graphql-sqlite-worker';
import DbWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/dbWorker?worker&url';
import ServiceWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/serviceWorker?worker&url';
import { ThemeProvider } from 'next-themes';
import { Route, Routes } from 'react-router-dom';
import DefaultLayout from '../components/layout/DefaultLayout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Routines from './pages/Routines';

export function App() {
  return (
    <GraphQLSQLiteWorkerProvider
      workerConfig={{ dbName: 'fitness.db', appVersion: '1.3.0', dbWorkerUrl: DbWorkerUrl }}
      autoInit={true}
      serviceWorkerUrl={ServiceWorkerUrl}
    >
      <ThemeProvider defaultTheme="light" enableSystem={false} attribute="class">
        <DefaultLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/routines" element={<Routines />} />
          </Routes>
        </DefaultLayout>
      </ThemeProvider>
    </GraphQLSQLiteWorkerProvider>
  );
}

export default App;