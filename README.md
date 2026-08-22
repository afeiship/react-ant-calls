# react-ant-calls
> Callable antd modals, prompts, messages, and notifications via react-call provider and hook.

[![version][version-image]][version-url]
[![license][license-image]][license-url]
[![download][download-image]][download-url]

## installation
```shell
npm install -S @jswork/react-ant-calls
```

## usage
  ```jsx
  import { CallsProvider, useCalls } from '@jswork/react-ant-calls';

  // main.tsx — 应用根部挂载一次
  function Root() {
    return (
      <CallsProvider>
        <App />
      </CallsProvider>
    );
  }

  // 任意子组件中调用
  function App() {
    const { alert, confirm, prompt, dialog, msg, notif } = useCalls();

    const handleDelete = async () => {
      const ok = await confirm.call({
        title: '删除确认',
        content: '删除后不可恢复，确定继续？',
      });
      if (ok) msg.success('已删除');
    };

    return <button onClick={handleDelete}>删除</button>;
  }
  ```

## preview
- https://afeiship.github.io/react-ant-calls/

## license
Code released under [the MIT license](https://github.com/afeiship/react-ant-calls/blob/master/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@jswork/react-ant-calls
[version-url]: https://npmjs.org/package/@jswork/react-ant-calls

[license-image]: https://img.shields.io/npm/l/@jswork/react-ant-calls
[license-url]: https://github.com/afeiship/react-ant-calls/blob/master/LICENSE.txt

[download-image]: https://img.shields.io/npm/dm/@jswork/react-ant-calls
[download-url]: https://www.npmjs.com/package/@jswork/react-ant-calls
