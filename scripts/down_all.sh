#!/usr/bin/env bash
# Tears down all docker-compose stacks in the reverse order of initialization.
#
# Usage:
#   scripts/down_all.sh [OPTIONS]
#
# Options:
#   --volumes         Remove named volumes declared in the "volumes" section
#   --remove-orphans  Remove containers for services not defined in the compose file
#   --no-color        Disable colored output
#   --help            Show this help and exit

set -euo pipefail

# -------- options --------
DOWN_ARGS=()
COLOR=1

print_help() {
  cat <<EOF
Usage: scripts/down_all.sh [OPTIONS]

Tears down all docker-compose stacks in the correct reverse order:
  - Tears down client stacks
  - Tears down shared services (Database, Vector)
  - Tears down platform services (Dashy, Portainer, Healthcheck)
  - Tears down reverse proxy (Traefik)

Options:
  --volumes         Remove named volumes declared in the "volumes" section
  --remove-orphans  Remove containers for services not defined in the compose file
  --no-color        Disable colored output
  --help            Show this help and exit
EOF
}

for arg in "$@"; do
  case "$arg" in
    --volumes) DOWN_ARGS+=("--volumes") ;;
    --remove-orphans) DOWN_ARGS+=("--remove-orphans") ;;
    --no-color) COLOR=0 ;;
    --help) print_help; exit 0 ;;
    *) echo "Unknown flag: $arg" >&2; print_help; exit 2 ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Please install Docker Desktop/Engine." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 not found (requires 'docker compose')." >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# -------- helpers --------
if [[ $COLOR -eq 1 ]]; then
  b() { printf "\033[1m%s\033[0m\n" "$*"; }
  g() { printf "\033[32m%s\033[0m\n" "$*"; }
  y() { printf "\033[33m%s\033[0m\n" "$*"; }
  r() { printf "\033[31m%s\033[0m\n" "$*"; }
else
  b() { printf "%s\n" "$*"; }
  g() { printf "%s\n" "$*"; }
  y() { printf "%s\n" "$*"; }
  r() { printf "%s\n" "$*"; }
fi

down_compose() {
  local dir="$1"; shift
  local extra_files=("${@}")

  b "→ Tearing down ${dir}"
  pushd "${ROOT_DIR}/${dir}" >/dev/null

  local cmd=(docker compose)
  if [[ ${#extra_files[@]} -gt 0 ]]; then
    for f in "${extra_files[@]}"; do
      [[ -f "$f" ]] || { r "Missing compose file: ${dir}/${f}"; exit 1; }
      cmd+=(-f "$f")
    done
  else
    [[ -f docker-compose.yml || -f docker-compose.yaml ]] || {
      r "No docker-compose.yml in ${dir}"; exit 1;
    }
  fi

  y "  stopping services..."
  # The "${DOWN_ARGS[@]}" part expands to any flags like --volumes passed to the script
  "${cmd[@]}" down "${DOWN_ARGS[@]}"

  popd >/dev/null
  g "  ✓ ${dir} is down"
}

# -------- start --------
b "==> Tearing down client stacks"
# Find all client compose files, except for the 'shared' ones which we handle separately
while IFS= read -r compose_file; do
  rel_dir="${compose_file%/*}"
  case "$rel_dir" in
    */clients/shared/*) continue ;;
  esac
  down_compose "$rel_dir"
done < <(
  find "${ROOT_DIR}/clients" -mindepth 3 -maxdepth 3 -type f -name "docker-compose.yml" \
  | sort -r \
  | sed "s|^${ROOT_DIR}/||"
)

b "==> Tearing down shared services (database, vector)"
down_compose "clients/shared/database"
down_compose "clients/shared/vector"

b "==> Tearing down platform services (dashy, portainer, healthcheck)"
down_compose "platform" "dashy.yml" "portainer.yml" "healthcheck.yml"

b "==> Tearing down reverse proxy"
down_compose "reverse-proxy"

b "==> All stacks torn down."
