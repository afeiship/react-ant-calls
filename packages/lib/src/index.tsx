import { createContext, useContext, type ReactNode } from 'react';
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

const CallsContext = createContext<Calls>(null!);

export function CallsProvider({ children }: { children: ReactNode }) {
  return (
    <CallsContext.Provider
      value={{
        alert: Alert,
        confirm: Confirm,
        prompt: Prompt,
        dialog: Dialog,
        msg,
        notif,
      }}
    >
      <Alert />
      <Confirm />
      <Prompt />
      <Dialog />
      {children}
    </CallsContext.Provider>
  );
}

export function useCalls() {
  return useContext(CallsContext);
}

export type { AlertProps, ConfirmProps, PromptProps, DialogProps };
export type { NotificationArgs } from './notification';
export { createCallableModal, type CallableModalApi, type CallableModalRenderProps } from './create-callable-modal';
export * from 'react-call';