/** @vitest-environment jsdom */
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  GraphQLSQLiteWorkerProvider,
  useGraphQLSQLiteWorker,
} from './context';

const initMock = vi.fn().mockResolvedValue(undefined);
const whenReadyMock = vi.fn().mockResolvedValue(undefined);
const initializeDatabaseMock = vi.fn().mockResolvedValue(undefined);
const insertInitialFitnessDataMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../lib/sqlite-worker', () => ({
  SQLiteWorker: class {
    init = initMock;
  },
}));

vi.mock('../lib/graphql-server', () => ({
  GraphQLServiceWorker: class {
    whenReady = whenReadyMock;
  },
}));

vi.mock('../lib/init', () => ({
  initializeDatabase: (...args: unknown[]) => initializeDatabaseMock(...args),
  insertInitialFitnessData: (...args: unknown[]) =>
    insertInitialFitnessDataMock(...args),
}));

vi.mock('./batchers', () => ({
  createSetQueryBatcher: () => ({}),
  createExerciseQueryBatcher: () => ({}),
  createFitnessQueryBatcher: () => ({}),
}));

function StatusProbe() {
  const { status } = useGraphQLSQLiteWorker();
  return <div data-testid="status">{status}</div>;
}

function ChildrenMarker() {
  return <div data-testid="children">ready-children</div>;
}

describe('GraphQLSQLiteWorkerProvider ready gate', () => {
  afterEach(() => {
    vi.clearAllMocks();
    initMock.mockResolvedValue(undefined);
    whenReadyMock.mockResolvedValue(undefined);
  });

  it('does not render children until initialize completes', async () => {
    let resolveInit!: () => void;
    initMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveInit = resolve;
        })
    );

    render(
      <GraphQLSQLiteWorkerProvider
        workerConfig={{
          dbName: 'test.db',
          appVersion: '0.0.0',
          dbWorkerUrl: '/db-worker.js',
        }}
        serviceWorkerUrl="/sw.js"
        fallback={<div data-testid="fallback">loading</div>}
      >
        <ChildrenMarker />
      </GraphQLSQLiteWorkerProvider>
    );

    expect(screen.getByTestId('fallback')).toBeTruthy();
    expect(screen.queryByTestId('children')).toBeNull();

    await act(async () => {
      resolveInit();
    });

    await waitFor(() => {
      expect(screen.getByTestId('children')).toBeTruthy();
    });
    expect(whenReadyMock).toHaveBeenCalled();
    expect(initializeDatabaseMock).toHaveBeenCalled();
    expect(insertInitialFitnessDataMock).toHaveBeenCalled();
  });

  it('exposes error status and allows retry', async () => {
    initMock
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined);

    render(
      <GraphQLSQLiteWorkerProvider
        workerConfig={{
          dbName: 'test.db',
          appVersion: '0.0.0',
          dbWorkerUrl: '/db-worker.js',
        }}
        serviceWorkerUrl="/sw.js"
      >
        <StatusProbe />
        <ChildrenMarker />
      </GraphQLSQLiteWorkerProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });
    expect(screen.queryByTestId('children')).toBeNull();

    await act(async () => {
      screen.getByRole('button', { name: '재시도' }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('children')).toBeTruthy();
    });
  });
});
