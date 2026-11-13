#!/usr/bin/env python3
"""Read-only acceptance of a trusted, local Atlas Junior project."""
import argparse
import pathlib
import stat
import sys
import tarfile

def check(root):
    def need(ok, message):
        if not ok:
            raise ValueError(message)
    def regular(name, limit=65536):
        p = root / name
        for part in [p, *p.parents]:
            if part == root:
                break
            need(not part.is_symlink(), f"symlink: {part}")
        need(p.is_file(), f"missing regular file: {name}")
        need(p.stat().st_size <= limit, f"oversize: {name}")
        return p
    expected = b'atlas-service-v1\n'
    need(regular('www/index.html').read_bytes() == expected, 'public payload')
    need(set(x.name for x in (root/'www').iterdir()) == {'index.html'}, 'unexpected public entry')
    conf = regular('config/service.conf')
    need(stat.S_IMODE(conf.stat().st_mode) == 0o600, 'config mode must be 600')
    need(stat.S_IMODE(conf.parent.stat().st_mode) == 0o700, 'config directory mode must be 700')
    need(bool(conf.read_bytes().strip()), 'empty config')
    logs = b'INFO start\nERROR timeout\nINFO ready\nERROR timeout\nERROR disk\n'
    need(regular('logs/service.log').read_bytes() == logs, 'log contract')
    need(regular('reports/errors.txt').read_bytes() == b'disk 1\ntimeout 2\n', 'error report')
    need(regular('restored/index.html').read_bytes() == expected, 'restored payload')
    archive = regular('backup/www.tar.gz')
    with tarfile.open(archive, 'r:gz') as tar:
        member = tar.next()
        need(member is not None and member.name == 'index.html' and member.isfile(), 'archive member')
        need(member.size == len(expected), 'archive member size')
        with tar.extractfile(member) as stream:
            need(stream.read(len(expected)+1) == expected, 'archive payload')
        need(tar.next() is None, 'unexpected archive member')
    need(bool(regular('reports/defense.txt').read_bytes().strip()), 'missing defense report')
    print('PASS: static Atlas Junior project contract (runtime defense separate)')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', type=pathlib.Path)
    args = parser.parse_args()
    try:
        check(args.project.resolve(strict=True))
    except (ValueError, OSError, tarfile.TarError, EOFError) as error:
        print(f'FAIL: {error}', file=sys.stderr)
        sys.exit(1)
