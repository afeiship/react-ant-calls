import { Button } from 'antd';
import { useCalls } from '@jswork/react-ant-calls';

function App() {
  const { alert, confirm, prompt, dialog, msg, notif } = useCalls();

  const handleConfirm = async () => {
    const ok = await confirm.call({
      title: '删除确认',
      content: '删除后不可恢复，确定继续？',
      okText: '删除',
      type: 'error',
    });
    if (ok) msg.success('已删除');
  };

  const handlePrompt = async () => {
    const name = await prompt.call({
      title: '输入用户名',
      content: '用户名将用于登录',
      initialValue: 'aric',
      validator: (v) => v.length >= 3 || '至少 3 个字符',
    });
    if (name) msg.info(`你好，${name}`);
  };

  const handleDialog = async () => {
    const ok = await dialog.call({
      title: '自定义弹窗',
      children: <div>这里是任意 React 内容的对话框。</div>,
      okText: '知道了',
    });
    if (ok) msg.success('对话框已确认');
  };

  const handleUpdate = () => {
    const p = alert.call({ title: '更新演示', content: '1 秒后文案会更新', type: 'info' });
    setTimeout(() => alert.update(p, { content: '文案已更新！' }), 1000);
  };

  return (
    <div style={{ padding: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button type="primary" onClick={() => alert.call({ title: '操作成功', content: '数据已保存', type: 'success' })}>
        Alert
      </Button>
      <Button onClick={handleConfirm}>Confirm</Button>
      <Button onClick={handlePrompt}>Prompt</Button>
      <Button onClick={handleDialog}>Dialog</Button>
      <Button onClick={handleUpdate}>Alert + Update</Button>
      <Button onClick={() => msg.info('这是一条消息')}>Msg</Button>
      <Button onClick={() => notif.success({ message: '保存成功', description: '数据已保存到服务器' })}>Notif</Button>
      <Button onClick={() => notif.warning({ message: '警告', description: '内存使用率较高' })}>Notif Warning</Button>
    </div>
  );
}

export default App;