#!/usr/bin/env bash
set -euo pipefail
lab=$(mktemp -d)
trap 'rm -rf -- "$lab"' EXIT

# Never run mkfs against a block device. This file is created by the test.
image="$lab/ext4.img"
truncate -s 64M "$image"
test -f "$image"
mkfs.ext4 -q -F "$image"
dumpe2fs -h "$image" > "$lab/metadata.txt"
grep -q 'has_journal' "$lab/metadata.txt"
debugfs -R 'stat <2>' "$image" > "$lab/root.txt"
grep -q 'Inode: 2' "$lab/root.txt"
e2fsck -fn "$image"
printf 'original\n' > "$lab/first"
if cp --reflink=always "$lab/first" "$lab/second"; then
  printf 'changed\n' > "$lab/second"
  test "$(cat "$lab/first")" = original
  test "$(cat "$lab/second")" = changed
  echo 'PASS: reflink copy independence'
else
  echo 'SKIP: runner filesystem does not support reflink'
fi
echo 'PASS: ext4 image creation, metadata, read-only check'
