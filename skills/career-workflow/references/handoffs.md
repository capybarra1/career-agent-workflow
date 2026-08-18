# Skill 交接契约

总控 Skill 用下列状态记录阶段产物。字段可以用 Markdown 表格或 JSON 表示，但命名保持一致。

```json
{
  "profile_base_url": "用户在当前会话提供的个人信息库链接",
  "jobs_base_url": "用户在当前会话提供的岗位库链接",
  "selected_job": {
    "company": "Example Company",
    "role": "AI Product Manager",
    "source": "推荐岗位明细或用户粘贴的 JD"
  },
  "resume_markdown": "output/example-company-ai-product-manager/resume.md",
  "resume_json": "output/example-company-ai-product-manager/resume.json",
  "output_directory": "output/example-company-ai-product-manager"
}
```

## 阶段产物

| 产出 Skill | 必需产物 | 下游 Skill |
|---|---|---|
| career-profile | 已确认事实、缺失项、写入结果 | job-screening / resume-writing |
| job-screening | selected_job、评分、匹配点、短板 | resume-writing |
| resume-writing | resume_markdown、resume_json、质检结果 | resume-layout |
| resume-layout | output_directory、网页、备份、PDF、校验状态 | 用户交付 |

## 安全规则

- 两个 Base URL 只存在于用户当前会话或用户明确指定的私有配置，不提交到 Git。
- 状态对象不包含访问令牌、应用密钥、设备授权码或飞书内部 ID。
- 任一写入仍由对应业务 Skill 执行，总控 Skill 不绕过确认门槛。
- 未确认的简历草稿不能标记为可排版终稿。
