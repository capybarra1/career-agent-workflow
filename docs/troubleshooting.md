# 故障排查

## 找不到 lark-cli

现象：Agent 或终端提示 `command not found`。

处理：

```bash
npx @larksuite/cli@latest install
npx skills add larksuite/cli -y -g
```

重新启动 Agent，再运行 `lark-cli --version`。

## 飞书配置尚未初始化

现象：提示缺少应用配置或 keychain 未初始化。

处理：运行 `lark-cli config init`。由 Agent 发起时应把原始授权链接和二维码交给用户，不在同一轮阻塞等待。

## 用户身份未授权或已过期

现象：`auth status` 显示 unavailable、expired 或 needs login。

处理：按 `lark-shared` 发起新的非阻塞用户授权。不得复用过期链接或设备码。

## scope 不足

现象：错误包含 `missing_scopes`、`console_url` 或授权提示。

处理：用户身份按错误提示申请最小 scope；bot 身份只在开发者后台开通权限，不能执行用户登录。

## Base 或数据表不明确

现象：标题搜索返回多个候选，或链接当前选中的 block 不是数据表。

处理：使用 `+url-resolve` 或 `+base-block-list` 读取候选名称，让用户选择；不要猜 Token 或 table ID。

## 字段缺失或结构变化

现象：字段不存在、类型不匹配或写入被忽略。

处理：重新读取字段列表，对照 Skill Schema 展示差异。用户确认迁移前停止写入；不通过换字段名或猜类型试错。

## 岗位查询不是全量

现象：返回 `has_more=true` 或只读了固定页数。

处理：继续分页或在 Base 云端完成筛选排序。无法读完时只能报告已读范围，不能给出“全库最佳”。

## JD 页面不可读

现象：动态页面、登录限制或安全策略阻止读取。

处理：优先使用岗位库中的 JD 摘要；仍不足时请用户粘贴完整 JD。不要根据职位名称补写要求。

## 简历事实不足

现象：经历只有职责、结果没有口径，或项目状态不明确。

处理：输出缺失信息表并追问。用户明确不要补充时，只能输出标明证据上限的保守版。

## A4 页面溢出

处理顺序：删除重复或弱相关文字 → 压缩句子 → 逐步减小间距和行距。正文不得低于 9.5 pt，页面不能贴底或裁切。

## A4 页面留白过多

处理顺序：补回岗位相关且真实的细节 → 调整字号与行距 → 微调安全边距。不要用空白块、装饰条、自我评价或虚构内容填充。

## PDF 导出含工具栏或不是一页

确认使用浏览器打印并启用打印样式；运行：

```bash
python3 skills/resume-layout/scripts/validate_resume.py <简历网页目录>
node skills/resume-layout/scripts/validate_page_fill.cjs <简历网页目录>
```

通过后再导出 PDF。
