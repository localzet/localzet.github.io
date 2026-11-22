"""Public-only GitHub contribution snapshot. No comments or secrets are published."""
import datetime as dt
import json
import os
import pathlib
import sys
import urllib.parse
import urllib.request
import urllib.error

USER = "localzet"
API = "https://api.github.com"
EXCLUDED_OWNERS = frozenset(json.loads(pathlib.Path(__file__).with_name("config.json").read_text(encoding="utf-8"))["excluded_owners"])

def external_repo(repo):
    return repo.split("/", 1)[0].casefold() not in EXCLUDED_OWNERS


def get(path, **params):
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
               "User-Agent": "localzet-contribution-hub"}
    if os.getenv("GH_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GH_TOKEN"]
    url = API + path + ("?" + urllib.parse.urlencode(params) if params else "")
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=20) as r:
        return json.load(r)

def pages(path, key=None, **params):
    for page in range(1, 11):
        data = get(path, per_page=100, page=page, **params)
        if isinstance(data, dict) and (data.get("incomplete_results") or data.get("total_count", 0) > 1000):
            raise RuntimeError("Incomplete GitHub result; split query")
        batch = data[key] if key else data
        yield from batch
        if len(batch) < 100 or (isinstance(data, dict) and page*100 >= data.get("total_count", 1001)):
            return
    raise RuntimeError("Pagination limit reached")

def optional(path, key=None, paginated=False):
    try:
        return list(pages(path, key)) if paginated else get(path)
    except (urllib.error.URLError, TimeoutError, RuntimeError) as e:
        print("Metadata unavailable:", path, e, file=sys.stderr)
        return None

def human(event):
    u = event.get("user") or {}
    login = u.get("login", "").lower()
    return login if login and u.get("type") != "Bot" and not login.endswith("[bot]") else ""

def review_status(reviews):
    if reviews is None:
        return "unknown"
    states = {}
    for r in sorted(reviews, key=lambda x: x.get("submitted_at") or ""):
        login = human(r)
        if login and login != USER and r.get("state") in ("APPROVED", "CHANGES_REQUESTED", "DISMISSED"):
            states[login] = r["state"]
    if "CHANGES_REQUESTED" in states.values():
        return "changes"
    if "APPROVED" in states.values():
        return "approved"
    return "waiting"

def reply_signal(*groups):
    if any(g is None for g in groups):
        return None
    own = other = ""
    for group in groups:
        for e in group:
            login = human(e)
            date = e.get("submitted_at") or e.get("created_at") or ""
            if login == USER:
                own = max(own, date)
            elif login:
                other = max(other, date)
    return bool(other and other > own)

def ci_status(checks, combined):
    if checks is None or combined is None:
        return "unknown"
    latest = {}
    for c in sorted(checks, key=lambda x: x.get("id", 0)):
        latest[((c.get("app") or {}).get("id"), c.get("name"))] = c
    checks = list(latest.values())
    state = combined.get("state") if combined.get("total_count") else None
    if state in ("failure", "error") or any(c.get("conclusion") in ("failure", "cancelled", "timed_out", "action_required", "startup_failure", "stale") for c in checks):
        return "failed"
    if state == "pending" or any(c.get("status") != "completed" for c in checks):
        return "pending"
    if state == "success" or (checks and all(c.get("conclusion") in ("success", "neutral", "skipped") for c in checks)):
        return "passed"
    return "unknown"

def collect():
    repos, items = {}, {}
    for kind in ("pr", "issue"):
        for i in pages("/search/issues", "items", q=f"author:{USER} is:public is:{kind} " + " ".join(f"-user:{owner}" for owner in sorted(EXCLUDED_OWNERS))):
            repo = i["repository_url"].removeprefix(API + "/repos/")
            if not external_repo(repo) or (i.get("user") or {}).get("login", "").lower() != USER:
                continue
            if repo not in repos:
                repos[repo] = get("/repos/" + repo)
            meta = repos[repo]
            if meta.get("private") is not False or meta.get("visibility") != "public":
                continue
            pr = i.get("pull_request") or {}
            item = dict(id=i["id"], repo=repo, number=i["number"], title=i["title"], url=i["html_url"],
                        kind=kind, state="merged" if pr.get("merged_at") else i["state"],
                        created=i["created_at"], updated=i["updated_at"], merged=pr.get("merged_at"),
                        draft=bool(i.get("draft")), language=meta.get("language"),
                        review="unknown", ci="unknown", conflict=None, reply=None)
            if item["state"] == "open":
                prefix = "/repos/" + repo
                n = str(i["number"])
                comments = optional(prefix + "/issues/" + n + "/comments", paginated=True)
                if kind == "pr":
                    path = prefix + "/pulls/" + n
                    detail = optional(path)
                    reviews = optional(path + "/reviews", paginated=True)
                    inline = optional(path + "/comments", paginated=True)
                    item["review"] = review_status(reviews)
                    item["reply"] = reply_signal(comments, reviews, inline)
                    if detail:
                        item["draft"] = bool(detail.get("draft"))
                        m = detail.get("mergeable")
                        item["conflict"] = not m if isinstance(m, bool) else None
                        sha = (detail.get("head") or {}).get("sha")
                        if sha:
                            path = prefix + "/commits/" + sha
                            item["ci"] = ci_status(optional(path + "/check-runs", "check_runs", True), optional(path + "/status"))
                else:
                    item["reply"] = reply_signal(comments)
            items[item["id"]] = item
    return {"generated": dt.datetime.now(dt.timezone.utc).isoformat(), "mode":"full",
            "items": sorted(items.values(), key=lambda i:i["updated"], reverse=True)}

def badge(data):
    items = data["items"]
    merged = sum(i["state"] == "merged" for i in items)
    opened = sum(i["kind"] == "pr" and i["state"] == "open" for i in items)
    repos = len({i["repo"] for i in items})
    date = data["generated"][:10]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="720" height="142" viewBox="0 0 720 142"><rect x="1" y="1" width="718" height="140" rx="12" fill="#0d1117" stroke="#30363d"/><g font-family="Verdana,Arial,sans-serif"><text x="24" y="29" font-size="15" fill="#e6edf3">Open source contribution hub</text><text x="24" y="74" font-size="30" font-weight="bold" fill="#bc8cff">{merged}</text><text x="24" y="96" font-size="12" fill="#9da7b3">Merged PRs</text><text x="255" y="74" font-size="30" font-weight="bold" fill="#3fb950">{opened}</text><text x="255" y="96" font-size="12" fill="#9da7b3">Open PRs</text><text x="484" y="74" font-size="30" font-weight="bold" fill="#58a6ff">{repos}</text><text x="484" y="96" font-size="12" fill="#9da7b3">Repositories</text><text x="24" y="124" font-size="10" fill="#9da7b3">External upstream contributions · Updated {date}</text></g></svg>'''

if __name__ == "__main__":
    data = collect()
    out = pathlib.Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    (out/"data.json").write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    (out/"summary.svg").write_text(badge(data), encoding="utf-8")
