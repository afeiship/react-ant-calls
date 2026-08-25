import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import { createContext, useContext } from 'react';
import { createCallableModal, type CallableModalRenderProps } from './create-callable-modal';

export interface DialogProps extends ModalProps {}

const DialogCloseContext = createContext<(result: boolean) => void>(() => {});

export function useDialogClose() {
  return useContext(DialogCloseContext);
}

export const Dialog = createCallableModal<DialogProps, boolean>(
  ({ props, api }: CallableModalRenderProps<DialogProps, boolean>) => (
    <DialogCloseContext.Provider value={api.close}>
      <Modal
        {...props}
        open={api.open}
        onOk={() => api.close(true)}
        onCancel={() => api.close(false)}
        afterClose={api.afterClose}
      />
    </DialogCloseContext.Provider>
  )
);
Dialog.displayName = 'Dialog';