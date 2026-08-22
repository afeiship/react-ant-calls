# 修复 Uncaught ReferenceError: React is not defined — 设计文档

日期：2026-08-22
状态：已确认（方案 A：移除死配置 + 构建配置清理）

## 背景

`packages/example` 运行 `pnpm dev` 时，浏览器抛
`Uncaught ReferenceError: React is not defined`。

## 根因

example 通过 workspace 依赖 `@jswork/react-ant-calls`，Vite 按 `module`
字段解析到 `packages/lib/dist/index.esm.js`。该产物中 JSX 被编译为裸
`React.createElement(...)`，但文件没有 `import React`，运行时即崩。

因果链（已通过 /tmp 对照实验 100% 确认）：

1. `packages/lib/tsconfig.json` 含模板遗留的
   `"emitDecoratorMetadata": true`（源码无任何 decorator，纯死配置）。
2. tsup 检测到 `emitDecoratorMetadata` 后，自动启用内置 SWC 插件接管
   TSX 转换（为支持 decorator metadata）。
3. 该 SWC 插件不读取 tsconfig 的 `"jsx": "react-jsx"`，使用 SWC 默认的
   classic JSX transform。
4. 产物变为 `React.createElement(...)` 且无 React import → 运行时
   ReferenceError。

对照实验：同样的 tsup 配置，仅去掉 `emitDecoratorMetadata` 后，Alert
组件产物从 `React.createElement(...)` 变为 `jsx-runtime` 自动导入，
构建恢复 esbuild 正常路径。

## 方案选择

- **A（采纳）：移除死配置 + 构建配置清理** — 根因消除，改动 ~15 行，
  零新依赖。
- B：保留 decorator 配置，给 tsup 显式配 SWC automatic runtime —
  为不存在的功能加隐晦配置，否决。
- C：换构建工具（tsdown/rolldown）— 改动面大，超出范围，否决。

## 文件改动

### 1. `packages/lib/tsconfig.json`

删除两行模板遗留的 decorator 配置：

```diff
-  "emitDecoratorMetadata": true,
-  "experimentalDecorators": true,
```

其余全部保持不动（`"jsx": "react-jsx"` 本来就正确）。

### 2. `packages/lib/tsup.config.ts`

```diff
   minify: true,
   sourcemap: true,
-  splitting: true,
   target: 'es6',
   bundle: true,
-  // external: ['react', 'react-dom', 'classnames'],
```

- 删 `splitting: true`：仅对多入口共享 chunk 有意义，单入口无效配置。
- 删注释掉的 `external` 行：tsup 在 bundle 模式下自动 external
  `dependencies`/`peerDependencies`（react/antd/react-call 均在
  peerDependencies），该注释只会误导。

### 3. `README.md`

修正错误的用法示例（现状为不存在的 default import），替换为实际 API：

````diff
-  import ReactAntCalls from '@jswork/react-ant-calls';
-  import '@jswork/react-ant-calls/dist/style.scss';
+  import { CallsProvider, useCalls } from '@jswork/react-ant-calls';
````

示例内容：

```jsx
// main.tsx — 挂载一次
<CallsProvider>
  <App />
</CallsProvider>

// 任意组件
const { alert, confirm, prompt, dialog, msg, notif } = useCalls();
const ok = await confirm.call({ title: '删除确认', content: '确定？' });
```

保持 README 现有 `usage` 代码块结构，仅替换内容；不动 badges、
installation、preview、license 等部分。

### 不改的东西

所有 `src/` 源码（index.tsx / alert / confirm / prompt / dialog /
msg / notification / create-callable-modal）、example 代码、测试——
它们本身没有问题。

## 验证方案

1. **修复即测试**：`pnpm build` 后验证产物：
   - `grep -c 'from"react/jsx-runtime"' dist/index.esm.js` 输出 > 0；
   - 产物中除 React 内部警告字符串外无裸 `React.createElement` 调用。
2. **端到端**：`pnpm dev` 启动 example，浏览器点一遍
   Alert/Confirm/Prompt/Dialog/Msg/Notif 按钮，控制台无 `ReferenceError`。
3. **回归**：`pnpm test`（现有 4 个测试）全部通过。
4. **类型产物**：`dist/index.d.ts` 正常生成（dts 构建不受影响）。

## 风险评估

- tsconfig 为 tsup 与 IDE/`tsc` 共用；源码无 decorator 语法，删除该
  选项对 IDE 无影响。
- 产物 API 面不变（导出、文件名、格式完全一致），对下游消费者零影响。
