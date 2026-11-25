#!/usr/bin/env bash
# FTP over explicit TLS (FTPS) to the voidbrain.net host, for the Deploy and legacy-copy workflows (F-007).
#
#   tools/ftps.sh check     log in, find the site folder (the one holding index.php and grover/), report old/
#   tools/ftps.sh dry-run   how many files an upload of dist/voidbrain-net/browser/ would send (writes nothing)
#   tools/ftps.sh upload    upload the build into FTP_DIR, never deleting; refuses until the old site is copied
#   tools/ftps.sh size      total size of FTP_DIR, without old/
#   tools/ftps.sh copy      copy FTP_DIR (without old/) into FTP_DIR/old/, never deleting; marks it complete last
#
# Environment: FTP_HOST, FTP_USER, LFTP_PASSWORD (read by lftp --env-password, never on a command line), and
# FTP_DIR (the site folder as the FTP login sees it, e.g. /public_html; "/" for the login folder itself).
# The repository is public and so are its Actions logs: lftp's own messages (which name server paths) go to a
# private file, and this script prints counts, sizes and yes/no answers. The one name it prints is the site
# folder found by check, which the owner then sets as FTP_DIR.
set -euo pipefail

mode="${1:-}"
build="dist/voidbrain-net/browser"
# Written into old/ as the copy's very last step: the copy is complete only when this file exists. (A dotfile:
# the site's rules refuse to serve it.)
marker=".copy-complete"

: "${FTP_HOST:?FTP_HOST is not set}"
: "${FTP_USER:?FTP_USER is not set}"
: "${LFTP_PASSWORD:?LFTP_PASSWORD is not set}"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
log="$work/lftp.log"

# TLS is required on the control and data channels, and the server certificate must verify.
settings='set ftp:ssl-force true; set ftp:ssl-protect-data true; set ssl:verify-certificate yes;
set ftp:list-options -a; set net:max-retries 2; set net:timeout 30; set cmd:fail-exit yes;'

# lftp with one script. Its standard output is returned; its messages go to the private log. On failure the
# public log gets only the number of error lines.
remote() {
  if ! lftp -c "$settings open --env-password -u \"$FTP_USER\" \"ftp://$FTP_HOST\"; $1" 2>>"$log"; then
    echo "lftp failed ($(grep -c . "$log" || true) error line(s), not shown: the logs are public)." >&2
    return 1
  fi
}

# 0 when the path exists, 1 when the server says it does not; any other failure (network, TLS, login) stops
# the script, so a glitch is never mistaken for "missing".
exists() {
  local err="$work/exists.err"
  if lftp -c "$settings open --env-password -u \"$FTP_USER\" \"ftp://$FTP_HOST\"; cls -d \"$1\"" >/dev/null 2>"$err"; then
    return 0
  fi
  if grep -qiE 'no such file|not found|does not exist|550' "$err"; then
    return 1
  fi
  echo "Could not tell whether a path exists: connection or permission problem (details not shown)." >&2
  exit 1
}

# "<folder>/<path>", where the folder "." (the login folder) adds nothing
under() {
  if [ "$1" = "." ]; then echo "$2"; else echo "${1%/}/$2"; fi
}

need_dir() {
  if [ -z "${FTP_DIR:-}" ]; then
    echo "FTP_DIR is not set: run the check mode, then set the repository variable FTP_DIR." >&2
    exit 1
  fi
  dir="${FTP_DIR%/}"
  [ -n "$dir" ] || dir="/"
  [ "$dir" != "/" ] || dir="."
}

need_build() {
  [ -f "$build/index.html" ] || { echo "No build in $build: run npm run build first." >&2; exit 1; }
}

case "$mode" in
  check)
    remote "pwd" >/dev/null
    echo "Login over FTPS: ok (certificate verified)."
    found=""
    for d in "${FTP_DIR:-.}" . htdocs public_html www httpdocs web html; do
      base="${d%/}"
      [ -n "$base" ] || base="."
      if exists "$(under "$base" index.php)" && exists "$(under "$base" grover)"; then
        found="$base"
        break
      fi
    done
    if [ -z "$found" ]; then
      echo "Site folder: not found among the usual names. Set FTP_DIR to the folder holding index.php and grover/."
      exit 1
    fi
    echo "Site folder: $found"
    if exists "$(under "$found" "old/$marker")"; then
      echo "old/: complete copy of the old site (upload is allowed)."
    elif exists "$(under "$found" old)"; then
      echo "old/: present but not marked complete (run the copy again; it resumes)."
    else
      echo "old/: missing (copy the old site into old/ before the first upload)."
    fi
    ;;

  dry-run)
    need_dir
    need_build
    out="$work/dry-run.txt"
    remote "mirror -R --dry-run --no-perms \"$build\" \"$dir\"" >"$out"
    n=$(grep -cE '^put ' "$out" || true)
    echo "Dry run: an upload would send $n file(s) into the site folder; nothing is deleted."
    ;;

  upload)
    need_dir
    need_build
    if ! exists "$(under "$dir" "old/$marker")"; then
      echo "Refused: the old site is not completely copied into old/ yet (legacy-to-old workflow, mode copy)." >&2
      exit 1
    fi
    # Everything but index.html first, then index.html: visitors never get a page whose bundles are missing.
    # mirror never deletes on the server without --delete, which this script never passes.
    remote "mirror -R --no-perms --parallel=4 -x '^index\\.html\$' \"$build\" \"$dir\""
    remote "put -O \"$dir\" \"$build/index.html\""
    echo "Uploaded $(find "$build" -type f | wc -l | tr -d ' ') file(s), index.html last; nothing was deleted."
    ;;

  size)
    need_dir
    remote "du -s -m --exclude=old \"$dir\"" | awk '{ print "Site folder size without old/: " $1 " MB" }'
    ;;

  copy)
    need_dir
    if exists "$(under "$dir" "old/$marker")"; then
      echo "old/ is already a complete copy of the old site: nothing to do."
      exit 0
    fi
    # Only the top-level old/ is skipped; an interrupted earlier copy is simply resumed (same files, overwritten).
    remote "mirror --no-perms --parallel=4 -x '^old/' \"$dir\" \"$work/site\""
    echo "Downloaded $(find "$work/site" -type f | wc -l | tr -d ' ') file(s)."
    remote "mirror -R --no-perms --parallel=4 \"$work/site\" \"$(under "$dir" old)\""
    : >"$work/$marker"
    remote "put -O \"$(under "$dir" old)\" \"$work/$marker\""
    echo "Copied the old site into old/ and marked it complete. Nothing was deleted."
    ;;

  *)
    echo "usage: tools/ftps.sh check|dry-run|upload|size|copy" >&2
    exit 2
    ;;
esac
