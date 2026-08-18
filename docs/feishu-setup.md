# 飞书连接与授权

这套工作流通过飞书官方 `lark-cli` 操作用户自己的多维表格。Skills 不保存账号、密钥或访问令牌。

## 1. 安装飞书 CLI 与官方 Skills

需要 Node.js 和 `npm`/`npx`。

```bash
npx @larksuite/cli@latest install
npx skills add larksuite/cli -y -g
```

官方项目与最新说明：[larksuite/cli](https://github.com/larksuite/cli)

## 2. 首次配置

人工在终端操作时运行：

```bash
lark-cli config init
lark-cli auth login --recommend
lark-cli auth status
```

如果由 Agent 帮助配置，Agent 应按 `lark-shared` 执行：

1. 后台启动 `lark-cli config init --new`；
2. 将原始授权链接和二维码展示给用户；
3. 用户完成配置后再进入登录；
4. 登录使用非阻塞授权，先把链接和二维码交给用户；
5. 用户回复已完成后，由 Agent 使用本次新生成的 device code 完成登录；
6. 使用 `lark-cli auth status --json --verify` 核验用户身份。

不要把授权链接、设备码、应用密钥或 Token 复制进项目文件。

## 3. 准备两个 Base

### 路径 A：连接已有 Base

向 Agent 提供：

- 个人求职信息库链接；
- 岗位跟踪库链接。

Agent 使用 `+url-resolve` 解析链接，再读取真实表名和字段。运行时 ID 不写入仓库。

### 路径 B：创建新模板

对 Agent 说：

> 按 career-profile 的 Schema 创建个人求职信息库，并按 job-screening 的字段创建岗位跟踪库。先展示表结构，确认后再创建。

个人库包含 8 张表：个人档案、教育经历、实习经历、经历素材、项目经历、技能与工具、目标岗位、荣誉奖项。

岗位库包含 2 张表：岗位清单、推荐岗位明细，并通过双向关联字段连接。

## 4. 权限与身份

- 默认显式使用 `--as user` 操作用户自己的资源。
- 用户权限不足时按错误提示申请最小 scope，不直接改用 bot。
- bot 无法代替用户读取个人资源。
- 写入记录前必须展示拟写入内容并获得确认。
- 第一版不删除表、字段或记录。

## 5. 连接测试

完成授权后，可以对 Agent 说：

> 只读检查这两个 Base 的标题、数据表和字段，不修改任何内容，并告诉我是否符合求职工作流 Schema。

成功标准：Agent 能显示 Base 标题和用户可读的表/字段名称，且不输出 Token 或内部 ID。
