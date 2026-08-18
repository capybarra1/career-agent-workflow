---
name: career-workflow
description: Use when a user asks to run or continue a multi-stage job-search workflow covering Feishu profile management, job screening, resume tailoring, and editable A4 resume export.
---

# Career Workflow

## 目标

识别用户当前处于求职流程的哪个阶段，检查输入，调用一个或多个业务 Skill，并把上游产物可靠地交给下游。

## 必读资料

多阶段任务开始前完整读取 [Skill 交接契约](references/handoffs.md)。

## 业务 Skill

- `career-profile`：录入、审计或更新个人信息库。
- `job-screening`：收集、核验、评分和排序岗位。
- `resume-writing`：根据已确认事实和目标 JD 改写简历。
- `resume-layout`：把已确认内容排成可编辑 A4 网页并导出。

## 路由规则

| 用户目标或当前状态 | 调用 Skill |
|---|---|
| 新建个人信息库、导入简历、补充经历 | career-profile |
| 收集岗位、比较 JD、筛选志愿 | job-screening |
| 已选岗位，需要诊断、改写或质检 | resume-writing |
| 文案已确认，需要排版、微调或 PDF | resume-layout |
| 一次请求包含多个阶段 | 按上述顺序串联 |

## 默认工作流

1. 复述本轮目标，列出已经提供和仍缺少的输入。
2. 检查 `lark-cli` 及飞书 Skills；缺少依赖时先完成安装或授权。
3. 需要飞书数据时解析两个 Base 链接，不能使用仓库示例或历史会话中的 ID。
4. 根据路由规则调用最少数量的业务 Skill。
5. 每个 Skill 完成后记录交接字段、已确认结果和停止状态。
6. 下游只消费上游已经确认并验证的产物。
7. 报告本轮完成内容、飞书写入位置、本地文件路径和下一步。

## 确认门槛

- 飞书新增或更新：先展示拟写入表、记录和值；用户确认后写入。
- 岗位推荐：说明读取范围、评分证据和硬门槛后再写回。
- 简历终稿：用户确认文案后才能进入排版。
- PDF：结构与页面填充验证通过后才能称为最终交付。

## 停止状态

遇到下列情况必须停在当前阶段并给出恢复动作：

- `lark-cli` 未安装、配置未完成或用户授权失效；
- Base、数据表或记录候选不唯一；
- 真实字段与预期 Schema 不一致；
- 用户尚未确认飞书写入；
- 核心经历缺少场景、个人措施或结果/里程碑；
- JD 无法读取且岗位库中没有可用文本；
- 简历页面溢出、内容填充不足或导出失败。

## 端到端 Prompt 的处理

用户可以直接说：

> 连接我的个人信息库和岗位库，筛选最适合我的两个 AI 产品岗位，为第一优先岗位生成一页定向简历并排版。

依次执行：

1. 检查个人事实是否足够；必要时调用 `career-profile` 补充。
2. 调用 `job-screening` 输出并确认岗位排序。
3. 调用 `resume-writing` 生成 Markdown、JSON 和质检结果。
4. 等待用户确认文案。
5. 调用 `resume-layout` 生成网页、备份和 PDF，并运行校验。

## 输出

```markdown
当前阶段：
已完成：
飞书写入：
本地产物：
验证结果：
下一步：
```

不输出访问凭据、内部 ID 或用户未要求公开的个人信息。
