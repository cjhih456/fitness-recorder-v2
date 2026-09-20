import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import SuspenseBoundary from './SuspenseBoundary';

describe('SuspenseBoundary', () => {
  it('shows Korean error copy and calls retry', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function FlakyChild() {
      if (shouldThrow) {
        throw new Error('boom');
      }
      return <div>복구됨</div>;
    }

    render(
      <SuspenseBoundary>
        <FlakyChild />
      </SuspenseBoundary>,
    );

    expect(screen.getByText('문제가 발생했습니다')).toBeTruthy();
    expect(screen.getByText('잠시 후 다시 시도해 주세요')).toBeTruthy();

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('복구됨')).toBeTruthy();
  });
});
