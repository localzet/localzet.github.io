#!/usr/bin/env bash
# Read-only acceptance for your own Atlas Notes Pro lab.
set -euo pipefail
export LC_ALL=C GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null GIT_OPTIONAL_LOCKS=0 GIT_NO_REPLACE_OBJECTS=1
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_CONFIG_COUNT GIT_CONFIG_PARAMETERS
fail(){ printf 'FAIL: %s\n' "$*" >&2; exit 1; }
pass(){ printf 'PASS: %s\n' "$*"; }
[[ $# == 1 && -d "$1" ]] || fail 'usage: bash check-git-middle.sh /path/to/atlas-pro'
root=$(cd -- "$1" && pwd -P)
app="$root/app"; lib="$root/library"; server="$root/app.git"; lsrv="$root/library.git"
ra="$root/restored-app"; rl="$root/restored-library"
g(){ git -c core.fsmonitor=false -c core.untrackedCache=false -C "$1" "${@:2}"; }
for r in "$app" "$lib" "$server" "$lsrv" "$ra" "$rl"; do [[ -d "$r" ]] || fail "missing $r"; done
for r in "$server" "$lsrv"; do [[ $(g "$r" rev-parse --is-bare-repository) == true ]] || fail 'expected bare server'; done
for r in "$app" "$lib" "$ra" "$rl"; do
  [[ $(g "$r" rev-parse --show-toplevel) == "$r" ]] || fail 'expected independent worktree'
  [[ $(g "$r" branch --show-current) == main && -z $(g "$r" status --porcelain) ]] || fail 'expected clean main'
  for op in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD rebase-merge rebase-apply sequencer BISECT_START; do
    [[ ! -e $(g "$r" rev-parse --path-format=absolute --git-path "$op") ]] || fail 'unfinished operation'
  done
done
[[ $(g "$app" remote get-url origin) == "$server" && $(g "$lib" remote get-url origin) == "$lsrv" ]] || fail 'incorrect original server URLs'
[[ -s "$root/evidence.txt" ]] || fail 'missing evidence'
declare -A ev=()
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^(good|defect|bad|fix|original|review|release|backport|main|lib1|lib2)=([0-9a-f]{40}|[0-9a-f]{64})$ ]] || fail 'invalid evidence line'
  key=${BASH_REMATCH[1]}; oid=${BASH_REMATCH[2]}
  [[ ! -v "ev[$key]" ]] || fail 'duplicate evidence key'
  r="$app"; [[ "$key" != lib1 && "$key" != lib2 ]] || r="$lib"
  [[ $(g "$r" rev-parse --verify "$oid^{commit}") == "$oid" ]] || fail "invalid commit $key"
  ev[$key]=$oid
done < "$root/evidence.txt"
for key in good defect bad fix original review release backport main lib1 lib2; do [[ -v "ev[$key]" ]] || fail "missing $key"; done
good=${ev[good]}; defect=${ev[defect]}; bad=${ev[bad]}; fix=${ev[fix]}; original=${ev[original]}; review=${ev[review]}; release=${ev[release]}; backport=${ev[backport]}; main=${ev[main]}; lib1=${ev[lib1]}; lib2=${ev[lib2]}
parents(){ g "$app" show -s --format=%P "$1"; }
eqfile(){ local val; val=$(g "$1" show "$2:$3" 2>/dev/null) || fail "missing $3"; [[ "$val" == "$4" ]] || fail "incorrect $3 at $2"; }
absent(){ if g "$app" cat-file -e "$1:$2" 2>/dev/null; then fail "unexpected $2"; fi; }
only(){ [[ $(g "$app" diff --name-only "$1" "$2") == "$3" ]] || fail "unexpected changed paths at $2"; }
[[ -z $(parents "$good") ]] || fail 'A1 must be root'
mapfile -t history < <(g "$app" rev-list --reverse "$bad")
[[ ${#history[@]} == 8 && ${history[0]} == "$good" && ${history[4]} == "$defect" ]] || fail 'expected eight versions and A5 defect'
for i in "${!history[@]}"; do
  oid=${history[i]}
  eqfile "$app" "$oid" version.txt "$((i+1))"
  if (( i<4 )); then eqfile "$app" "$oid" behavior.txt guard=good; else eqfile "$app" "$oid" behavior.txt guard=broken; fi
  if (( i>0 )); then [[ $(parents "$oid") == "${history[i-1]}" ]] || fail 'history is not linear'; fi
done
[[ $(parents "$fix") == "$bad" && $(parents "$release") == "$defect" && $(parents "$backport") == "$release" ]] || fail 'incorrect fix/backport ancestry'
only "$bad" "$fix" behavior.txt
only "$defect" "$release" support.txt
only "$release" "$backport" behavior.txt
eqfile "$app" "$fix" behavior.txt guard=good
eqfile "$app" "$backport" behavior.txt guard=good
eqfile "$app" "$backport" support.txt support=legacy
eqfile "$app" "$backport" version.txt 5
g "$app" show -s --format=%B "$backport" | grep -Fq "(cherry picked from commit $fix)" || fail 'missing backport provenance'
pass 'regression boundary and selective backport'
[[ $(g "$app" rev-parse refs/heads/original-review) == "$original" ]] || fail 'original-review ref missing'
[[ $(g "$app" rev-list --count "$fix..$original") == 3 && $(g "$app" rev-list --count "$fix..$review") == 2 ]] || fail 'wrong series lengths'
[[ $(g "$app" rev-parse "$original~3") == "$fix" && $(g "$app" rev-parse "$review~2") == "$fix" ]] || fail 'wrong review base'
p=$(g "$app" rev-parse "$review^")
[[ $(parents "$p") == "$fix" && $(parents "$review") == "$p" ]] || fail 'review must be linear'
only "$fix" "$p" search.txt
only "$p" "$review" guide.txt
eqfile "$app" "$p" search.txt search=v2
absent "$p" guide.txt
eqfile "$app" "$review" search.txt search=v2
eqfile "$app" "$review" guide.txt guide=search
eqfile "$app" "$original~2" search.txt search=v1
eqfile "$app" "$original~1" guide.txt guide=search
[[ $(g "$app" rev-parse "$original^{tree}") == "$(g "$app" rev-parse "$review^{tree}")" ]] || fail 'rewritten tree differs'
[[ $(parents "$main") == "$review" ]] || fail 'main must follow review'
only "$review" "$main" vendor/library
pass 'review checkpoints and final tree'
for oid in "$good" "$backport" "$main"; do
  [[ $(g "$app" ls-tree "$oid" vendor/library | cut -d' ' -f1) == 160000 ]] || fail 'expected gitlink'
  expected="$lib1"; [[ "$oid" != "$main" ]] || expected="$lib2"
  [[ $(g "$app" rev-parse "$oid:vendor/library") == "$expected" ]] || fail 'incorrect dependency pin'
done
eqfile "$lib" "$lib1" lib.txt library=v1
eqfile "$lib" "$lib2" lib.txt library=v2
[[ $(g "$lib" show -s --format=%P "$lib2") == "$lib1" ]] || fail 'library lineage'
eqfile "$app" "$main" .gitattributes '*.txt text eol=lf'
for path in behavior.txt version.txt search.txt guide.txt; do
  if g "$app" show "$main:$path" | grep -q $'\r'; then fail 'CR in canonical blob'; fi
done
for pair in "$app:$main" "$lib:$lib2" "$server:$main" "$lsrv:$lib2" "$ra:$main" "$rl:$lib2" "$app/vendor/library:$lib2" "$ra/vendor/library:$lib2"; do
  r=${pair%:*}; oid=${pair##*:}
  [[ -d "$r" && $(g "$r" rev-parse HEAD) == "$oid" ]] || fail "unexpected HEAD at $r"
done
[[ $(g "$server" rev-parse refs/heads/release/1) == "$backport" && $(g "$server" rev-parse refs/heads/review/search) == "$review" ]] || fail 'published lines differ'
[[ -z $(g "$server" for-each-ref --format='%(refname)' refs/heads/blocked refs/heads/probe refs/heads/original-review) ]] || fail 'unexpected server ref'
[[ $(g "$ra" config --get submodule.vendor/library.url) == "$rl" ]] || fail 'restored submodule must use restored library'
pass 'gitlinks, canonical bytes and published references'
[[ -s "$root/allowed_signers" ]] || fail 'missing trusted signers'
for r in "$app" "$server" "$ra"; do
  for pair in "v1.1:$backport" "v2.0:$main"; do
    tag=${pair%:*}; oid=${pair##*:}
    [[ $(g "$r" cat-file -t "refs/tags/$tag") == tag && $(g "$r" rev-parse "refs/tags/$tag^{}") == "$oid" ]] || fail 'wrong annotated release tag'
    g "$r" -c gpg.format=ssh -c "gpg.ssh.allowedSignersFile=$root/allowed_signers" verify-tag "refs/tags/$tag" || fail 'tag signature rejected'
  done
  g "$r" -c gpg.format=ssh -c "gpg.ssh.allowedSignersFile=$root/allowed_signers" verify-commit "$main" || fail 'main signature rejected'
done
pass 'signed release targets and explicit trust policy'
for name in app library; do
  bundle="$root/$name.bundle"; [[ -s "$bundle" ]] || fail 'missing bundle'
  r="$root/restored-$name"
  g "$r" bundle verify "$bundle" || fail 'invalid bundle'
  # Exact snapshot of all server refs, not a proof of recovery of non-Git data.
  expected=$(g "$root/$name.git" for-each-ref --format='%(objectname) %(refname)' | sort)
  actual=$(g "$r" bundle list-heads "$bundle" | awk '$2!="HEAD"' | sort)
  [[ "$actual" == "$expected" ]] || fail "bundle refs differ: $name"
  g "$r" fsck --full || fail 'restored object store failed fsck'
done
eqfile "$ra" refs/remotes/origin/release/1 support.txt support=legacy
[[ $(g "$ra" rev-parse refs/remotes/origin/release/1) == "$backport" ]] || fail 'restored release differs'
[[ -s "$root/bisect.log" && -s "$root/report.md" ]] || fail 'missing manual evidence'
pass 'bundle refs, restored snapshots and manual evidence present'
printf 'PASS: Atlas Notes Pro machine-checkable acceptance; defend process and trust separately.\n'
