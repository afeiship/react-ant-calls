# 修复 React is not defined 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 `packages/example` 运行时的 `Uncaught ReferenceError: React is not defined`，清理误导性构建配置，修正 README 错误示例。

**Architecture:** 根因是 `packages/lib/tsconfig.json` 中模板遗留的 `emitDecoratorMetadata: true` 触发 tsup 内置 SWC 插件接管 TSX 转换，该插件不读取 `jsx: "react-jsx"` 配置，导致产物输出 classic JSX（裸 `React.createElement` 且无 React import）。删除死配置后 tsup 恢复 esbuild 正常路径，产物自动引入 `react/jsx-runtime`。不改任何 `src/` 源码。

**Tech Stack:** pnpm workspace、tsup 8.5.1（esbuild 后端）、Vite 8、vitest。

---

### Task 1: 移除 tsconfig 中的 decorator 死配置（根因修复）

**Files:**
- Modify: `packages/lib/tsconfig.json:22-23`

- [ ] **Step 1: 修改 tsconfig.json**

删除这两行（当前位于 `esModuleInterop` 之后）：

```diff
     "esModuleInterop": true,
-    "emitDecoratorMetadata": true,
-    "experimentalDecorators": true,
     "allowSyntheticDefaultImports": true,
```

修改后完整文件内容：

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "module": "esnext",
    "target": "es5",
    "lib": [
      "es6",
      "dom",
      "es2016",
      "es2017"
    ],
    "sourceMap": true,
    "allowJs": false,
    "jsx": "react-jsx",
    "declaration": true,
    "moduleResolution": "bundler",
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "noImplicitAny": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "types": ["vitest/globals"]
  },
  "include": [
    "src",
    "public",
    "__tests__",
    "vitest.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

- [ ] **Step 2: 重新构建并验证产物（修复即测试）**

```bash
pnpm build
```

预期：构建成功，输出 `dist/index.esm.js`、`dist/index.cjs.js`、`dist/index.d.ts`。

验证 ESM 产物使用 jsx-runtime 自动导入：

```bash
grep -c 'from"react/jsx-runtime"' packages/lib/dist/index.esm.js
```

预期输出：`6`（或任意 > 0 的数字）。

验证产物中无裸 `React.createElement` 调用（仅剩 React 内部警告字符串里的 2 处文本匹配，属正常）：

```bash
grep -oE 'React\.createElement' packages/lib/dist/index.esm.js | wc -l
```

预期输出：`0` 或 `2`（若为 2，用 `grep -oE '.{30}React\.createElement.{20}' packages/lib/dist/index.esm.js` 确认两处均在 `"..."` 字符串内——React 内部的 deprecation 警告文本，而非代码调用）。

- [ ] **Step 3: 运行测试确认无回归**

```bash
pnpm test
```

预期：`Test Files  2 passed (2)`，`Tests  4 passed (4)`。

- [ ] **Step 4: 提交**

```bash
git add packages/lib/tsconfig.json
git commit -m "fix: remove stale decorator tsconfig options causing bare React.createElement in dist

emitDecoratorMetadata triggered tsup's SWC plugin which ignores
jsx: react-jsx, emitting classic JSX without importing React.
This caused 'Uncaught ReferenceError: React is not defined' in
consumers loading dist/index.esm.js."
```

---

### Task 2: 清理 tsup.config.ts 无效配置

**Files:**
- Modify: `packages/lib/tsup.config.ts:12-16`

- [ ] **Step 1: 修改 tsup.config.ts**

删除 `splitting: true`（单入口无共享 chunk，无效配置）和注释掉的 `external` 行（tsup bundle 模式下 peerDependencies 自动 external，注释只会误导）：

```diff
   // react
   minify: true,
   sourcemap: true,
-  splitting: true,
   target: 'es6',
   bundle: true,
-  // external: ['react', 'react-dom', 'classnames'],
   loader: {
     '.svg': 'dataurl',
   },
```

修改后完整文件内容：

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  cjsInterop: true,

  // react
  minify: true,
  sourcemap: true,
  target: 'es6',
  bundle: true,
  loader: {
    '.svg': 'dataurl',
  },
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
});
```

- [ ] **Step 2: 重新构建并验证产物不变**

```bash
pnpm build
```

预期：构建成功，产物文件名与之前一致（`index.cjs.js`、`index.esm.js`、`index.d.ts`、`index.d.mts`、`style.css`）。

```bash
grep -c 'from"react/jsx-runtime"' packages/lib/dist/index.esm.js
```

预期输出：与 Task 1 Step 2 相同（> 0）。

- [ ] **Step 3: 提交**

```bash
git add packages/lib/tsup.config.ts
git commit -m "chore: remove ineffective splitting and misleading external comment from tsup config"
```

---

### Task 3: 修正 README 错误用法示例

**Files:**
- Modify: `README.md:13-32`（usage 代码块）

- [ ] **Step 1: 替换 usage 代码块**

将 README 中 `## usage` 下整个 ```js 代码块（现为不存在的 default import `ReactAntCalls`）替换为实际 API：

````markdown
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
````

其余部分（badges、installation、preview、license）不动。

- [ ] **Step 2: 验证示例 API 与源码导出一致**

```bash
grep -n 'export function CallsProvider\|export function useCalls' packages/lib/src/index.tsx
```

预期输出：

```
21:export function CallsProvider({ children }: { children: ReactNode }) {
44:export function useCalls() {
```

- [ ] **Step 3: 提交**

```bash
git add README.md
git commit -m "docs: fix README usage to actual CallsProvider/useCalls API"
```

---

### Task 4: 端到端验证 example

**Files:**
- 无代码改动，仅验证。

- [ ] **Step 1: 启动 example 开发服务器**

```bash
pnpm dev
```

预期：Vite 启动，输出类似 `Local: http://localhost:5173/`。

- [ ] **Step 2: 浏览器验证所有交互**

打开 `http://localhost:5173/`，依次点击 8 个按钮：Alert、Confirm、Prompt、Dialog、Alert + Update、Msg、Notif、Notif Warning。

预期：
- 页面正常渲染按钮，无白屏；
- 每个按钮触发对应弹窗/消息/通知；
- 浏览器 DevTools Console 无 `Uncaught ReferenceError: React is not defined` 或其他报错。

- [ ] **Step 3: 停止开发服务器并确认工作区干净**

```bash
git status
```

预期：`nothing to commit, working tree clean`。

- [ ] **Step 4: 汇报验证结果**

向用户汇报：产物 grep 结果、测试结果、浏览器逐按钮验证结果。
