#!/usr/bin/env bash
# Publica automaticamente o jogo no GitHub.
# Roda como hook "Stop" do Claude Code (ao fim de cada resposta) e também pode
# ser executado à mão:  bash .claude/hooks/auto-push.sh
# Se nada mudou, sai sem fazer nada. Nunca bloqueia o Claude (sempre exit 0).

cd "$(dirname "$0")/../.." || exit 0
export GIT_TERMINAL_PROMPT=0

say() {
  # Mensagem que aparece na interface do Claude Code
  local msg=${1//\\/\\\\}
  msg=${msg//\"/\\\"}
  printf '{"systemMessage":"%s"}\n' "$msg"
}

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

git add -A
if ! git diff --cached --quiet; then
  files=$(git diff --cached --name-only | head -20)
  count=$(git diff --cached --name-only | wc -l | tr -d ' ')
  git commit -q -F - <<EOF || { say "GitHub: falha ao criar o commit."; exit 0; }
Atualização automática ($(date '+%Y-%m-%d %H:%M')) — $count arquivo(s)

$files

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
fi

# Nada a enviar?
ahead=$(git rev-list --count '@{u}..HEAD' 2>/dev/null || echo 1)
[ "$ahead" = "0" ] && exit 0

if ! out=$(timeout 50 git push -q origin HEAD 2>&1); then
  # O GitHub tem algo que não está aqui (ex.: edição feita pelo site): integra e tenta de novo
  if timeout 50 git pull -q --rebase --autostash origin main >/dev/null 2>&1 \
     && out=$(timeout 50 git push -q origin HEAD 2>&1); then
    :
  else
    git rebase --abort >/dev/null 2>&1
    say "GitHub: não consegui enviar. $(echo "$out" | tail -1)"
    exit 0
  fi
fi

say "Jogo enviado para o GitHub ($ahead commit(s))."
exit 0
