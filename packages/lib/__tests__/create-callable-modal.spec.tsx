import { render } from '@testing-library/react';
import { createCallableModal } from '../src/create-callable-modal';
import { Modal } from 'antd';

describe('createCallableModal', () => {
  it('should render without throwing', () => {
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

    expect(() => render(<TestModal />)).not.toThrow();
  });
});