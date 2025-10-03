#!/usr/bin/env bash
# Initializes all docker-compose stacks in the correct order and ensures
# required Docker networks ("edge" and "shared") exist.
#
# Usage:
#   scripts/init_all.sh [OPTIONS]
#
# Options:
#   --pull        Pull fresh images before starting
#   --recreate    Force recreate containers
#   --no-color    Disable colored output
#   --help        Show this help and exit

set -euo pipefail

# -------- options --------
PULL=0
RECREATE=0
COLOR=1

print_help() {
  cat <<EOF
Usage: scripts/init_all.sh [OPTIONS]

Starts all docker-compose stacks in the correct order:
  - Creates 'edge' and 'shared' networks if missing
  - Starts reverse proxy (Traefik)
  - Starts platform services (Dashy, Portainer, Healthcheck)
  - Starts shared services (Database, Vector)

Options:
  --pull        Pull fresh images before starting
  --recreate    Force recreate containers
  --no-color    Disable colored output
  --help        Show this help and exit
EOF
}

for arg in "$@"; do
  case "$arg" in
    --pull) PULL=1 ;;
    --recreate) RECREATE=1 ;;
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

ensure_network() {
  local net="$1"
  if docker network inspect "$net" >/dev/null 2>&1; then
    y "  network '$net' already exists"
  else
    y "  creating network '$net'..."
    docker network create --driver bridge "$net" >/dev/null
    g "  ✓ created network '$net'"
  fi
}

run_compose() {
  local dir="$1"; shift
  local extra_files=("${@}")
  local up_args=(up -d)

  [[ $RECREATE -eq 1 ]] && up_args+=(--force-recreate)

  b "→ ${dir}"
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

  [[ $PULL -eq 1 ]] && { y "  pulling images..."; "${cmd[@]}" pull; }

  y "  starting services..."
  "${cmd[@]}" "${up_args[@]}"

  popd >/dev/null
  g "  ✓ ${dir} is up"
}

# -------- start --------
b "==> Ensuring required Docker networks exist"
ensure_network "edge"
ensure_network "shared"

b "==> Starting reverse proxy"
run_compose "reverse-proxy"

b "==> Starting platform services (dashy, portainer, healthcheck)"
run_compose "platform" "dashy.yml" "portainer.yml" "healthcheck.yml"

b "==> Starting shared services (database, vector)"
run_compose "clients/shared/database"
run_compose "clients/shared/vector"

b "==> Starting client stacks"
while IFS= read -r compose_file; do
  rel_dir="${compose_file%/*}"
  case "$rel_dir" in
    */clients/shared/*) continue ;;   # skip shared (já iniciado acima)
  esac
  run_compose "$rel_dir"
done < <(
  find "${ROOT_DIR}/clients" -mindepth 3 -maxdepth 3 -type f -name "docker-compose.yml" \
  | sort \
  | sed "s|^${ROOT_DIR}/||"
)

b "==> All stacks started."
