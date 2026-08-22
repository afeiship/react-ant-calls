# react-ant-calls
> Callable antd modals, prompts, messages, and notifications via react-call provider and hook.

## installation
```shell
pnpm add @jswork/react-ant-calls
```

## Usage
```tsx
import { CallsProvider, useCalls } from '@jswork/react-ant-calls';

function App() {
  const { alert, confirm, prompt, msg } = useCalls();

  const handleClick = async () => {
    const ok = await confirm.call({ title: '确认', content: '确定继续？' });
    if (ok) msg.success('已确认');
  };

  return <button onClick={handleClick}>测试</button>;
}

ReactDOM.createRoot(root).render(
  <CallsProvider>
    <App />
  </CallsProvider>
);
```
