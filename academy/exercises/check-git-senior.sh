#!/usr/bin/env bash
# Read-only acceptance for your own Atlas Notes Enterprise lab.
set -euo pipefail
export LC_ALL=C GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null GIT_OPTIONAL_LOCKS=0 GIT_NO_REPLACE_OBJECTS=1
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_CONFIG_COUNT GIT_CONFIG_PARAMETERS
fail(){ printf 'FAIL: %s\n' "$*" >&2; exit 1; }
pass(){ printf 'PASS: %s\n' "$*"; }
[[ $# == 1 && -d "$1" ]] || fail 'usage: bash check-git-senior.sh /path/to/atlas-enterprise'
root=$(cd -- "$1" && pwd -P)
app="$root/app"; server="$root/server.git"; hot="$root/hotfix"; partial="$root/partial"; restored="$root/restored"
g(){ git -c core.fsmonitor=false -c core.untrackedCache=false -C "$1" "${@:2}"; }
for r in "$app" "$server" "$hot" "$partial" "$restored"; do [[ -d "$r" ]] || fail "missing $r"; done
[[ $(g "$server" rev-parse --is-bare-repository) == true ]] || fail 'expected bare server'
for r in "$app" "$hot" "$partial" "$restored"; do
  [[ $(g "$r" rev-parse --show-toplevel) == "$r" ]] || fail 'expected distinct worktree'
  for op in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD rebase-merge rebase-apply sequencer BISECT_START; do
    [[ ! -e $(g "$r" rev-parse --path-format=absolute --git-path "$op") ]] || fail 'unfinished operation'
  done
done
[[ $(g "$app" rev-parse --show-object-format) == sha1 ]] || fail 'expected SHA-1 lab'
[[ $(g "$app" remote get-url origin) == "$server" ]] || fail 'incorrect origin'
[[ -s "$root/evidence.txt" ]] || fail 'missing evidence'
declare -A ev=()
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^(base|hotfix|topic|merge|candidate|rescue|old_doc|new_doc)=([0-9a-f]{40})$ ]] || fail 'invalid evidence line'
  key=${BASH_REMATCH[1]}; oid=${BASH_REMATCH[2]}
  [[ ! -v "ev[$key]" ]] || fail 'duplicate evidence key'
  kind=commit; [[ "$key" != old_doc && "$key" != new_doc ]] || kind=blob
  [[ $(g "$app" cat-file -t "$oid") == "$kind" ]] || fail "invalid object type $key"
  ev[$key]=$oid
done < "$root/evidence.txt"
for key in base hotfix topic merge candidate rescue old_doc new_doc; do [[ -v "ev[$key]" ]] || fail "missing $key"; done
a=${ev[base]}; h=${ev[hotfix]}; t=${ev[topic]}; m=${ev[merge]}; c=${ev[candidate]}; r=${ev[rescue]}; old=${ev[old_doc]}; new=${ev[new_doc]}
parent(){ g "$app" show -s --format=%P "$1"; }
only(){ [[ $(g "$app" diff --name-only "$1" "$2") == "$3" ]] || fail "unexpected changed paths at $2"; }
eqfile(){ local actual; actual=$(g "$1" show "$2:$3" 2>/dev/null) || fail "missing $3"; [[ "$actual" == "$4" ]] || fail "incorrect $3 at $2"; }
[[ $(g "$app" rev-list --count "$a") == 2 ]] || fail 'expected two base commits'
first=$(g "$app" rev-parse "$a^")
only "$first" "$a" docs/manual.txt
[[ $(parent "$h") == "$a" && $(parent "$t") == "$a" && $(parent "$m") == "$h $t" && $(parent "$c") == "$m" && $(parent "$r") == "$a" ]] || fail 'incorrect commit graph'
only "$a" "$h" app/timeout.txt
only "$a" "$t" app/timeout.txt
only "$h" "$m" app/timeout.txt
only "$m" "$c" app/review.txt
only "$a" "$r" rescue.txt
eqfile "$app" "$first" app/timeout.txt timeout=30
eqfile "$app" "$h" app/timeout.txt timeout=40
eqfile "$app" "$t" app/timeout.txt timeout=60
eqfile "$app" "$m" app/timeout.txt timeout=35
eqfile "$app" "$c" app/review.txt reviewed=yes
eqfile "$app" "$r" rescue.txt rescued=yes
eqfile "$app" "$first" docs/manual.txt manual=v1
eqfile "$app" "$a" docs/manual.txt manual=v2
[[ "$old" != "$new" && $(g "$app" rev-parse "$first:docs/manual.txt") == "$old" && $(g "$app" rev-parse "$a:docs/manual.txt") == "$new" ]] || fail 'incorrect document blob OIDs'
pass 'commit graph, resolution and minimal candidate'
[[ $(g "$app" branch --show-current) == main && $(g "$app" rev-parse HEAD) == "$a" ]] || fail 'main moved'
eqfile "$app" "$a" wip.txt base
[[ $(g "$app" show :wip.txt) == staged && $(cat "$app/wip.txt") == working ]] || fail 'main staged or working content lost'
[[ $(g "$app" status --porcelain) == 'MM wip.txt' ]] || fail 'unexpected main working state'
[[ $(g "$hot" branch --show-current) == hotfix && $(g "$hot" rev-parse HEAD) == "$m" && -z $(g "$hot" status --porcelain) ]] || fail 'expected clean hotfix at merge'
[[ $(g "$app" rev-parse --path-format=absolute --git-common-dir) == "$(g "$hot" rev-parse --path-format=absolute --git-common-dir)" ]] || fail 'worktrees do not share common dir'
[[ $(g "$app" rev-parse --path-format=absolute --git-path index) != "$(g "$hot" rev-parse --path-format=absolute --git-path index)" ]] || fail 'expected independent indexes'
pass 'parallel worktrees preserve both main versions'
for pair in "main:$a" "hotfix:$m" "topic:$t" "candidate:$c" "audit:$c" "rescue:$r"; do
  name=${pair%:*}; oid=${pair##*:}
  for repo in "$app" "$server"; do [[ $(g "$repo" rev-parse "refs/heads/$name") == "$oid" ]] || fail "wrong ref $name"; done
done
[[ $(g "$server" symbolic-ref HEAD) == refs/heads/main ]] || fail 'server default branch'
[[ $(g "$server" for-each-ref --format='%(refname)' | sort) == "$(printf '%s\n' refs/heads/{audit,candidate,hotfix,main,rescue,topic})" ]] || fail 'unexpected published refs'
pass 'candidate and audit refs plus rescue'
[[ $(g "$partial" branch --show-current) == candidate && $(g "$partial" rev-parse HEAD) == "$c" ]] || fail 'partial candidate mismatch'
[[ $(g "$partial" rev-parse --is-shallow-repository) == false ]] || fail 'partial history must not be shallow'
[[ $(g "$partial" config --get remote.origin.promisor) == true && $(g "$partial" config --get remote.origin.partialclonefilter) == blob:none ]] || fail 'expected blob:none promisor'
[[ $(g "$partial" config --get core.sparseCheckout) == true && ! -e "$partial/docs/manual.txt" ]] || fail 'expected sparse docs exclusion'
[[ $(cat "$partial/app/timeout.txt") == timeout=35 && $(cat "$partial/app/review.txt") == reviewed=yes && $(cat "$partial/wip.txt") == base ]] || fail 'partial working snapshot'
missing=$(g "$partial" rev-list --objects --missing=print HEAD) || fail 'partial missing query'
grep -Fxq "?$old" <<<"$missing" || fail 'old doc unexpectedly loaded'
if grep -Fxq "?$new" <<<"$missing"; then fail 'new doc not loaded'; fi
pass 'partial local objects and sparse working paths differ'
[[ -s "$root/reachable.txt" ]] || fail 'missing baseline'
actual=$(g "$server" rev-list --objects --all | cut -d' ' -f1 | sort -u)
[[ "$actual" == "$(cat "$root/reachable.txt")" ]] || fail 'reachable baseline differs'
[[ $(find "$server/objects/pack" -name '*.pack' | wc -l) -ge 2 ]] || fail 'expected multiple packs'
[[ -n $(find "$server/objects/pack" -name 'multi-pack-index-*.bitmap' -print -quit) ]] || fail 'missing MIDX bitmap'
[[ -f "$server/objects/info/commit-graph" || -f "$server/objects/info/commit-graphs/commit-graph-chain" ]] || fail 'missing commit graph'
g "$server" commit-graph verify || fail 'commit graph invalid'
g "$server" multi-pack-index verify || fail 'MIDX invalid'
for idx in "$server"/objects/pack/*.idx; do g "$server" verify-pack "$idx" || fail 'pack invalid'; done
[[ $(g "$server" rev-list --use-bitmap-index --objects --all | cut -d' ' -f1 | sort -u) == "$actual" ]] || fail 'bitmap traversal differs'
g "$server" fsck --full || fail 'server fsck failed'
pass 'physical indexes and equivalent reachability'
bundle="$root/enterprise.bundle"
[[ -s "$bundle" ]] || fail 'missing bundle'
g "$restored" bundle verify "$bundle" || fail 'bundle verification failed'
expected=$(g "$server" for-each-ref --format='%(objectname) %(refname)' | sort)
[[ $(g "$restored" bundle list-heads "$bundle" | awk '$2!="HEAD"' | sort) == "$expected" ]] || fail 'bundle refs differ'
[[ $(g "$restored" branch --show-current) == candidate && $(g "$restored" rev-parse HEAD) == "$c" && -z $(g "$restored" status --porcelain) ]] || fail 'restored checkout differs'
[[ $(g "$restored" rev-parse --is-shallow-repository) == false && ! -e "$restored/.git/objects/info/alternates" ]] || fail 'restored clone not independent'
if g "$restored" config --get-regexp '^remote\..*\.promisor$' >/dev/null; then fail 'restored promisor config'; fi
if [[ -n $(find "$restored/.git/objects/pack" -name '*.promisor' -print -quit) ]]; then fail 'restored promisor pack'; fi
for pair in "main:$a" "hotfix:$m" "topic:$t" "candidate:$c" "audit:$c" "rescue:$r"; do
  name=${pair%:*}; oid=${pair##*:}
  [[ $(g "$restored" rev-parse "refs/remotes/origin/$name") == "$oid" ]] || fail "restored ref $name differs"
done
restored_objects=$(g "$restored" rev-list --objects --missing=print --all)
if grep -q '^?' <<<"$restored_objects"; then fail 'restored missing objects'; fi
[[ $(cut -d' ' -f1 <<<"$restored_objects" | sort -u) == "$actual" ]] || fail 'restored reachable objects differ'
eqfile "$restored" "$first" docs/manual.txt manual=v1
eqfile "$restored" "$c" docs/manual.txt manual=v2
eqfile "$restored" "$r" rescue.txt rescued=yes
eqfile "$restored" "$c" app/review.txt reviewed=yes
g "$restored" fsck --full || fail 'restored fsck failed'
for log in report.md transaction.log rerere.log offline.log trace.log; do [[ -s "$root/$log" ]] || fail "missing manual evidence $log"; done
grep -Fq 'version 2' "$root/trace.log" && grep -Fq 'command=ls-refs' "$root/trace.log" || fail 'missing v2 trace markers'
pass 'full independent recovery and manual evidence present'
printf 'PASS: Atlas Notes Enterprise machine-checkable acceptance; defend process and measurements separately.\n'
