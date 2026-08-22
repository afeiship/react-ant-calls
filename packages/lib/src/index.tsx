import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Callable } from 'react-call';
import { Alert, type AlertProps } from './alert';
import { Confirm, type ConfirmProps } from './confirm';
import { Prompt, type PromptProps } from './prompt';
import { Dialog, type DialogProps } from './dialog';
import { msg } from './msg';
import { notif } from './notification';

export interface Calls {
  alert: Callable<AlertProps, void, {}>;
  confirm: Callable<ConfirmProps, boolean, {}>;
  prompt: Callable<PromptProps, string | null, {}>;
  dialog: Callable<DialogProps, boolean, {}>;
  msg: typeof msg;
  notif: typeof notif;
}

const CallsContext = createContext<Calls | null>(null);

export function CallsProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      alert: Alert,
      confirm: Confirm,
      prompt: Prompt,
      dialog: Dialog,
      msg,
      notif,
    }),
    []
  );
  return (
    <CallsContext.Provider value={value}>
      <Alert />
      <Confirm />
      <Prompt />
      <Dialog />
      {children}
    </CallsContext.Provider>
  );
}

export function useCalls() {
  const ctx = useContext(CallsContext);
  if (!ctx) throw new Error('useCalls must be used within a <CallsProvider>');
  return ctx;
}

export type { AlertProps, ConfirmProps, PromptProps, DialogProps };
export type { NotificationArgs } from './notification';
export { createCallableModal, type CallableModalApi, type CallableModalRenderProps } from './create-callable-modal';
export { Alert } from './alert';
export { Confirm } from './confirm';
export { Prompt } from './prompt';
export { Dialog, useDialogClose } from './dialog';
export { msg } from './msg';
export { notif } from './notification';
export * from 'react-call';