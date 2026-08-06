# Vendored skill

This is a copy of Danggeun's official `seed-design` Agent Skill, checked in so that a fresh clone
works without a network fetch.

The canonical copy lives in `.agents/skills/seed-design/`, where `skills.sh`-compatible agents look
for it. This directory mirrors it for Cursor.

Refresh both with:

```bash
pnpm dlx skills add https://github.com/daangn/seed-design --skill seed-design
cp -R .agents/skills/seed-design/. .cursor/skills/seed-design/
```
