import { Modal } from 'antd';
import { createContext, useContext, type ReactNode } from 'react';
import { createCallableModal, type CallableModalRenderProps } from './create-callable-modal';

export interface DialogProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  okText?: string;
  cancelText?: string;
  width?: number;
  closable?: boolean;
}

const DialogCloseContext = createContext<(result: boolean) => void>(() => {});

export function useDialogClose() {
  return useContext(DialogCloseContext);
}

export const Dialog = createCallableModal<DialogProps, boolean>(
  ({ props, api }: CallableModalRenderProps<DialogProps, boolean>) => (
    <DialogCloseContext.Provider value={api.close}>
      <Modal
        open={api.open}
        title={props.title}
        width={props.width ?? 520}
        closable={props.closable ?? true}
        okText={props.okText ?? 'OK'}
        cancelText={props.cancelText ?? 'Cancel'}
        footer={props.footer}
        onOk={() => api.close(true)}
        onCancel={() => api.close(false)}
        afterClose={api.afterClose}
        centered
      >
        {props.children}
      </Modal>
    </DialogCloseContext.Provider>
  )
);
Dialog.displayName = 'Dialog';