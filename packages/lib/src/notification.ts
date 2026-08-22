import { notification } from 'antd';
import type { ArgsProps } from 'antd/es/notification';

export const notif = {
  success: (args: ArgsProps) => notification.success(args),
  error: (args: ArgsProps) => notification.error(args),
  info: (args: ArgsProps) => notification.info(args),
  warning: (args: ArgsProps) => notification.warning(args),
  open: (args: ArgsProps) => notification.open(args),
  destroy: (key?: React.Key) => notification.destroy(key),
};

export type { ArgsProps as NotificationArgs };