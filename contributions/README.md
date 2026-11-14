# Contribution Hub

Public PRs and issues authored by localzet outside own repositories. The unified Pages workflow refreshes data every 30 minutes. Review and reply signals are heuristics; unknown metadata is not treated as success. Only public metadata is published. The checked-in snapshot is a dated fallback. Run tests with `python3 -m unittest discover -s contributions -p 'test_*.py'` and `node --check contributions/app.js`.

Owner exclusions are maintained in `config.json` (case-insensitive). The collector applies them both at search time and before publishing; the fallback dataset follows the same exclusions. Update the list when affiliations change.
