import { createCallable, type Callable } from 'react-call';
import { useEffect, useRef, useState, type FC } from 'react';

export interface CallableModalApi<R> {
  open: boolean;
  close: (result: R) => void;
  afterClose: () => void;
}

export interface CallableModalRenderProps<P, R> {
  props: P;
  api: CallableModalApi<R>;
}

type RenderFn<P, R> = FC<CallableModalRenderProps<P, R>>;

export function createCallableModal<P, R>(render: RenderFn<P, R>): Callable<P, R> {
  return createCallable<P, R>(({ call, ...rest }) => {
    const [open, setOpen] = useState(false);
    const resultRef = useRef<R>(null as R);
    const closingRef = useRef(false);
    const endedRef = useRef(false);

    useEffect(() => {
      setOpen(true);
    }, []);

    const close = (result: R) => {
      if (closingRef.current) return;
      closingRef.current = true;
      resultRef.current = result;
      setOpen(false);
    };

    const afterClose = () => {
      if (endedRef.current) return;
      endedRef.current = true;
      call.end(resultRef.current);
    };

    const RenderContent = render;
    return <RenderContent props={rest as P} api={{ open, close, afterClose }} />;
  });
}