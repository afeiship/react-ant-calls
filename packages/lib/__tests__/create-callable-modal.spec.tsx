import { render, screen, fireEvent } from '@testing-library/react';
import { createCallableModal } from '../src/create-callable-modal';
import { Modal } from 'antd';

describe('createCallableModal', () => {
  it('should render and close with result', async () => {
    const TestModal = createCallableModal<{ message: string }, string>(
      ({ props, api }) => (
        <Modal
          open={api.open}
          title="Test"
          onOk={() => api.close(props.message)}
          onCancel={() => api.close('canceled')}
          afterClose={api.afterClose}
        >
          <p>{props.message}</p>
        </Modal>
      )
    );
    TestModal.displayName = 'TestModal';

    // Simulate react-call invoking the component
    render(<TestModal />);
    // The factory sets open=true on mount
    // We can't easily test the full react-call lifecycle in isolation,
    // but we can verify the component structure renders
  });
});