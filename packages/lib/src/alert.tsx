import { Modal } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { createCallableModal } from './create-callable-modal';

export interface AlertProps {
  title: string;
  content: string;
  okText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const ICONS: Record<NonNullable<AlertProps['type']>, { icon: ReactNode; color: string }> = {
  info: { icon: <InfoCircleOutlined />, color: '#1677ff' },
  success: { icon: <CheckCircleOutlined />, color: '#52c41a' },
  warning: { icon: <ExclamationCircleOutlined />, color: '#faad14' },
  error: { icon: <CloseCircleOutlined />, color: '#ff4d4f' },
};

export const Alert = createCallableModal<AlertProps, void>(({ props, api }) => {
  const type = props.type ?? 'info';
  const { icon, color } = ICONS[type];

  return (
    <Modal
      open={api.open}
      title={props.title}
      okText={props.okText ?? 'OK'}
      cancelButtonProps={{ style: { display: 'none' } }}
      onOk={() => api.close()}
      onCancel={() => api.close()}
      afterClose={api.afterClose}
      centered
      closable={false}
      maskClosable={false}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ color, fontSize: 22, lineHeight: '24px' }}>{icon}</span>
        <p style={{ color: '#333', margin: 0 }}>{props.content}</p>
      </div>
    </Modal>
  );
});
Alert.displayName = 'Alert';