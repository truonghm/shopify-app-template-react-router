#!/bin/bash

# Create symlinks from .codex/skills to .claude/skills
# This allows both Claude Code and Codex to share the same skill definitions

mkdir -p .codex/skills

for skill in .claude/skills/*; do
  ln -s "../../.claude/skills/$(basename $skill)" ".codex/skills/$(basename $skill)"
done

echo "Symlinks created successfully in .codex/skills"
