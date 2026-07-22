# JSON Fix

JSON Fix 是一个纯浏览器端运行的 JSON 修复、格式化和美化工具。用户可以粘贴 JSON，或上传 `.json` / `.txt` 文件，应用会尝试修复常见 JSON 错误，并输出缩进清晰、便于复制和下载的格式化 JSON。

所有处理都在本地浏览器中完成，不需要后端，也不会上传用户数据。

## 功能特性

- 粘贴原始 JSON 内容
- 上传 `.json` 或 `.txt` 文件
- 使用 `jsonrepair` 自动修复常见 JSON 错误
- 使用 `JSON.parse()` 校验修复结果
- 使用 `JSON.stringify(parsed, null, 2)` 输出漂亮缩进
- 显示修复成功提示和错误信息
- 一键复制格式化结果
- 一键下载 `pretty.json`
- 一键清空输入和输出
- 显示输入和输出字符数
- 内置示例 JSON
- 支持英文 / 中文界面切换，默认英文
- 响应式布局，适配桌面端和移动端

## 技术栈

- Vue 3
- Vite
- TypeScript
- Tailwind CSS
- jsonrepair
- lucide-vue-next

## 本地运行

```bash
npm install
npm run dev
```

启动后，根据终端输出打开本地地址，通常是：

```text
http://localhost:5173
```

## 构建生产版本

```bash
npm run build
```

构建产物会输出到 `dist` 目录。

## 隐私说明

JSON Fix 不包含登录、数据库或后端 API。输入内容、上传文件、修复过程、复制和下载操作都只发生在浏览器本地。

你的 JSON 永远不会离开你的浏览器。

## 使用说明

1. 在左侧输入框粘贴 JSON，或点击上传按钮选择 `.json` / `.txt` 文件。
2. 点击 `Repair & Format`。
3. 如果修复成功，右侧会显示格式化后的 JSON。
4. 可以点击复制按钮复制结果，或点击下载按钮保存为 `pretty.json`。
5. 如需重新开始，点击清空按钮。
