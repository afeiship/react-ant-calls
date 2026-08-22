import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CallsProvider, useCalls } from '../src';
import { msg } from '../src/msg';
import { notif } from '../src/notification';

describe('CallsProvider', () => {
  function TestComponent() {
    const calls = useCalls();
    return (
      <div>
        <span data-testid="calls-ready">
          {typeof calls.alert === 'function' && typeof calls.confirm === 'function' ? 'ready' : 'no'}
        </span>
      </div>
    );
  }

  it('should provide all calls via context', () => {
    render(
      <CallsProvider>
        <TestComponent />
      </CallsProvider>
    );
    expect(screen.getByTestId('calls-ready')).toHaveTextContent('ready');
  });
});

describe('msg', () => {
  it('should have expected methods', () => {
    expect(typeof msg.success).toBe('function');
    expect(typeof msg.error).toBe('function');
    expect(typeof msg.info).toBe('function');
    expect(typeof msg.warning).toBe('function');
  });
});

describe('notif', () => {
  it('should have expected methods', () => {
    expect(typeof notif.success).toBe('function');
    expect(typeof notif.error).toBe('function');
    expect(typeof notif.info).toBe('function');
    expect(typeof notif.warning).toBe('function');
    expect(typeof notif.open).toBe('function');
    expect(typeof notif.destroy).toBe('function');
  });
});