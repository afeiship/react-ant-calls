import { message } from 'antd';

export const msg = {
  success: (text: string, duration?: number) => message.success(text, duration),
  error: (text: string, duration?: number) => message.error(text, duration),
  info: (text: string, duration?: number) => message.info(text, duration),
  warning: (text: string, duration?: number) => message.warning(text, duration),
};