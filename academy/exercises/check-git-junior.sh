#!/usr/bin/env bash
# Read-only acceptance checker for Atlas Notes Mini. Run only on your own lab.
set -euo pipefail
export LC_ALL=C GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null GIT_OPTIONAL_LOCKS=0 GIT_NO_REPLACE_OBJECTS=1
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_CONFIG_COUNT GIT_CONFIG_PARAMETERS
fail(){ printf 'FAIL: %s\n' "$*" >&2; exit 1; }
pass(){ printf 'PASS: %s\n' "$*"; }
[[ $# == 1 && -d "$1" ]] || fail 'usage: bash check-git-junior.sh /path/to/atlas-mini'
root=$(cd -- "$1" && pwd -P)
a="$root/alice"; b="$root/bob"; s="$root/server.git"
g(){ git -c core.fsmonitor=false -c core.untrackedCache=false -C "$1" "${@:2}"; }
for r in "$a" "$b" "$s"; do [[ -d "$r" ]] || fail 'missing alice, bob or server.git'; done
[[ $(g "$s" rev-parse --is-bare-repository) == true ]] || fail 'server.git must be bare'
for r in "$a" "$b"; do
  [[ $(g "$r" rev-parse --show-toplevel) == "$r" ]] || fail 'expected independent worktree root'
  [[ $(g "$r" branch --show-current) == main ]] || fail 'both working copies must be on main'
  [[ $(g "$r" remote get-url origin) == "$s" ]] || fail 'origin must be the absolute lab server path'
  [[ -z $(g "$r" status --porcelain) ]] || fail 'working copies must be clean'
  [[ -z $(g "$r" ls-files -u) ]] || fail 'unresolved index entries'
  for op in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD rebase-merge rebase-apply sequencer; do
    [[ ! -e $(g "$r" rev-parse --path-format=absolute --git-path "$op") ]] || fail 'unfinished operation'
  done
  [[ -z $(g "$r" stash list) ]] || fail 'unfinished stash exercise'
done
[[ $(g "$a" config --local user.name) != "$(g "$b" config --local user.name)" ]] || fail 'configure distinct local author names'
tip=$(g "$s" rev-parse refs/heads/main)
for r in "$a" "$b"; do
  [[ $(g "$r" rev-parse HEAD) == "$tip" && $(g "$r" rev-parse refs/remotes/origin/main) == "$tip" ]] || fail 'local main, tracking refs and server main must match'
done
pass 'three repositories, clean copies and synchronized main'
[[ -f "$root/evidence.txt" ]] || fail 'missing evidence.txt'
declare -A ev=()
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^(base|merge|bad|peer|revert)=([0-9a-f]{40}|[0-9a-f]{64})$ ]] || fail 'invalid evidence line: expected key=full lowercase OID'
  key=${BASH_REMATCH[1]}; oid=${BASH_REMATCH[2]}
  [[ ! -v "ev[$key]" ]] || fail 'duplicate evidence key'
  [[ $(g "$s" rev-parse --verify "$oid^{commit}") == "$oid" ]] || fail 'evidence must reference a commit'
  g "$s" merge-base --is-ancestor "$oid" "$tip" || fail 'evidence is not in server main ancestry'
  ev[$key]=$oid
done < "$root/evidence.txt"
for k in base merge bad peer revert; do [[ -v "ev[$k]" ]] || fail "missing evidence key $k"; done
base=${ev[base]}; merge=${ev[merge]}; bad=${ev[bad]}; peer=${ev[peer]}; rev=${ev[revert]}
parents(){ g "$s" show -s --format=%P "$1"; }
fileeq(){ local content; content=$(g "$s" show "$1:$2" 2>/dev/null) || fail "missing $2 at $3"; [[ "$content" == "$4" ]] || fail "incorrect $2 at $3"; }
config(){ local content; content=$(g "$s" show "$1:app.conf" 2>/dev/null) || fail "missing app.conf at $2"; [[ $(printf '%s\n' "$content" | sort) == "$(printf 'port=9090\ntimeout=%s\n' "$3" | sort)" ]] || fail "incorrect app.conf at $2"; }
config "$base" base 30
read -r p1 p2 extra <<< "$(parents "$merge")"
[[ -n "$p1" && -n "$p2" && -z "${extra:-}" ]] || fail 'merge must have exactly two parents'
[[ $(g "$s" merge-base "$p1" "$p2") == "$base" ]] || fail 'merge parents must diverge from evidence base'
[[ $(g "$s" rev-parse refs/heads/feature/search) == "$p2" ]] || fail 'feature/search must identify second parent'
config "$p1" main-parent 40
config "$p2" feature-parent 60
fileeq "$p1" guide.md main-parent startup=verified
fileeq "$p2" search.txt feature-parent search=enabled
config "$merge" merge 45
fileeq "$merge" guide.md merge startup=verified
fileeq "$merge" search.txt merge search=enabled
pass 'divergent parents, conflicting inputs and resolved merge'
g "$s" merge-base --is-ancestor "$merge" "$bad" || fail 'bad must follow merge'
[[ $(parents "$bad") == "$merge" ]] || fail 'bad must be a direct child of merge'
[[ $(parents "$peer") == "$bad" ]] || fail 'peer must be a direct child of bad'
[[ $(parents "$rev") == "$peer" ]] || fail 'revert must be a direct child of peer'
[[ "$tip" == "$rev" ]] || fail 'revert must be final main tip'
[[ $(g "$s" diff --name-only "$merge" "$bad") == app.conf ]] || fail 'bad must change only app.conf'
[[ $(g "$s" diff --name-only "$bad" "$peer") == support.md ]] || fail 'peer must change only support.md'
[[ $(g "$s" diff --name-only "$peer" "$rev") == app.conf ]] || fail 'revert must change only app.conf'
config "$bad" bad 90; config "$peer" peer 90; config "$rev" revert 45
fileeq "$peer" support.md peer support=available
fileeq "$rev" support.md revert support=available
fileeq "$rev" guide.md revert startup=verified
fileeq "$rev" search.txt revert search=enabled
pass 'published error reversed without losing peer work'
fileeq "$rev" .env.example final TOKEN=replace-me
g "$s" cat-file -e "$rev:README.md" || fail 'README missing'
g "$s" cat-file -e "$rev:.gitignore" || fail '.gitignore missing'
[[ -f "$a/.env" && -f "$a/build/out.bin" && -f "$a/scratch.tmp" ]] || fail 'local demo files missing'
[[ $(cat -- "$a/.env") == TOKEN=atlas-local-demo-only ]] || fail 'local demo marker mismatch'
for path in .env build/out.bin scratch.tmp; do g "$a" check-ignore -q -- "$path" || fail 'local demo file not ignored'; done
[[ ! -e "$b/.env" ]] || fail 'Bob must not have Alice local .env'
for r in "$a" "$b" "$s"; do
  [[ -z $(g "$r" log --all --format=%H -- .env build/ scratch.tmp) ]] || fail 'forbidden path in reachable history'
  commits=$(g "$r" rev-list --all)
  while IFS= read -r commit; do
    [[ -n "$commit" ]] || continue
    if g "$r" grep -q -F 'atlas-local-demo-only' "$commit" --; then fail 'demo credential marker in reachable snapshot'; else code=$?; [[ "$code" == 1 ]] || fail 'unable to scan snapshot'; fi
  done <<< "$commits"
done
pass 'ignored local files and reachable-history demo marker scan'
[[ -s "$root/report.md" ]] || fail 'missing report.md for manual review'
pass 'report present (contents require manual review)'
printf 'PASS: Atlas Notes Mini machine-checkable acceptance. Review report and defend the project separately.\n'
