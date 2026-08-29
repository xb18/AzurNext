---
name: sync-upstream
description: >-
  同步上游/master分支最新更新并变基合入到当前私有开发分支。当用户要求同步上游、拉取最新官方代码、合并master、或者同步分支更新时使用此技能。
---

# 同步上游更新技能 (Sync Upstream Skill)

本技能指导 AI Agent 和开发者在保持本地私有定制的前提下，安全、整洁地同步上游 master 分支的最新变更。

---

## 核心原则

1. **保持 master 纯净**：本地 master 分支永远与官方/上游保持 100% 一致，不在 master 上做任何私有修改。
2. **私有修改在独立分支**：所有个人定制、脚本和修改均维护在独立分支（如 `feat/dev-workspace`）。
3. **优先使用 Rebase（变基）**：将私有提交平移追加在最新的 master 之后，保持线性的 Git 历史。
4. **仅推送到个人 Remote**：只向 origin（个人的 Fork 仓库）推送，绝不向上游主仓库推送私有代码。

---

## 标准执行流程

### 第一步：检查并保存当前工作区
在开始同步前，确保工作区干净：
```powershell
# 检查是否有未提交修改
git status
```
- 若有未完成的代码修改，使用 `git stash` 暂存或先行提交。
- 记录当前所在的分支名（例如当前分支为 `feat/dev-workspace`）。

### 第二步：同步上游主分支到本地与个人 Fork 的 master
如果已配置上游源（`upstream`，如官方原仓库），将自动拉取官方最新代码并同步到本地和你的 Fork 仓库：
```powershell
# 1. 检查并添加 upstream 远程仓库（已配置为 https://github.com/wess09/AzurPilot.git）
# git remote add upstream https://github.com/wess09/AzurPilot.git

# 2. 抓取上游最新分支信息
git fetch upstream

# 3. 切换到本地 master 并对齐到上游最新提交
git checkout master
git merge --ff-only upstream/master

# 4. 同步更新你自己 GitHub 上的 master 分支
git push origin master
```
*(注：如果未配置 upstream，而是在 GitHub 网页点击了 "Sync fork"，则直接运行 `git checkout master; git pull origin master`)*

### 第三步：将 master 变基合入开发分支
```powershell
# 1. 切回你的开发分支
git checkout feat/dev-workspace

# 2. 将 master 的最新更新变基到当前分支之下
git rebase master
```

### 第四步：冲突处理（如遇冲突）
若 `rebase` 过程中出现冲突：
1. 查看冲突文件：`git status`
2. 逐个解决冲突文件中的冲突标记（优先保留上游新特性的同时适配本地定制逻辑）。
3. 标记已解决：`git add <file>`
4. 继续变基：`git rebase --continue`
*(若想中止变基回退：git rebase --abort)*

### 第五步：项目环境与配置同步检查
检查本次同步是否包含依赖或配置文件的变动：
```powershell
# 若 uv.lock 或 pyproject.toml 发生变动，同步依赖
uv sync --frozen

# 若配置定义文件（YAML）发生变动，重新生成配置产物
uv run -m module.config.config_updater
```

### 第六步：推送到个人远程备份
```powershell
# 使用 --force-with-lease 安全覆盖远程个人开发分支
git push origin feat/dev-workspace --force-with-lease
```

---

## 快捷命令参考表

| 操作 | 命令 |
|---|---|
| 快速全流程同步 | `git checkout master; git pull origin master; git checkout feat/dev-workspace; git rebase master` |
| 中止变基 | `git rebase --abort` |
| 解决冲突后继续 | `git add .; git rebase --continue` |
| 安全推送到个人库 | `git push origin feat/dev-workspace --force-with-lease` |
