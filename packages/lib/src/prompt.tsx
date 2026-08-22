import { Input, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { createCallableModal } from './create-callable-modal';

export interface PromptProps {
  title: string;
  content: string;
  initialValue?: string;
  placeholder?: string;
  okText?: string;
  cancelText?: string;
  validator?: (value: string) => true | string;
}

export const Prompt = createCallableModal<PromptProps, string | null>(({ props, api }) => {
  const [value, setValue] = useState(props.initialValue ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(props.initialValue ?? '');
    setError(null);
  }, [props.initialValue]);

  const handleOk = () => {
    const result = props.validator?.(value) ?? true;
    if (result !== true) {
      setError(typeof result === 'string' ? result : '输入不合法');
      return;
    }
    setError(null);
    api.close(value);
  };

  return (
    <Modal
      open={api.open}
      title={props.title}
      okText={props.okText ?? 'Confirm'}
      cancelText={props.cancelText ?? 'Cancel'}
      onOk={handleOk}
      onCancel={() => api.close(null)}
      afterClose={api.afterClose}
      centered
    >
      <p style={{ marginBottom: 12, color: '#333' }}>{props.content}</p>
      <Input
        value={value}
        status={error ? 'error' : undefined}
        placeholder={props.placeholder}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={handleOk}
        autoFocus
      />
      {error && <div style={{ marginTop: 4, fontSize: 12, color: '#ff4d4f' }}>{error}</div>}
    </Modal>
  );
});
Prompt.displayName = 'Prompt';
