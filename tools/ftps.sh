#!/usr/bin/env bash
# FTP over explicit TLS (FTPS) to the voidbrain.net host, for the Deploy and legacy-copy workflows (F-007).
#
#   tools/ftps.sh check     log in, find the site folder (the one holding index.php and grover/), report old/
#   tools/ftps.sh dry-run   how many files an upload of dist/voidbrain-net/browser/ would send (writes nothing)
#   tools/ftps.sh upload    upload the build into FTP_DIR, never deleting; refuses until old/index.php exists
#   tools/ftps.sh size      total size of FTP_DIR, without old/
#   tools/ftps.sh copy      copy FTP_DIR (without old/) into FTP_DIR/old/, never deleting
#
# Environment: FTP_HOST, FTP_USER, LFTP_PASSWORD (read by lftp --env-password, never on a command line), and
# FTP_DIR (the site folder as the FTP login sees it, e.g. /public_html; "/" for the login folder itself).
# The repository is public and so are its Actions logs: this script prints counts, sizes and yes/no answers,
# never the server's file names, and never the credentials.
set -euo pipefail

mode="${1:-}"
build="dist/voidbrain-net/browser"

: "${FTP_HOST:?FTP_HOST is not set}"
: "${FTP_USER:?FTP_USER is not set}"
: "${LFTP_PASSWORD:?LFTP_PASSWORD is not set}"

# TLS is required on the control and data channels, and the server certificate must verify.
settings='set ftp:ssl-force true; set ftp:ssl-protect-data true; set ssl:verify-certificate yes;
set ftp:list-options -a; set net:max-retries 2; set net:timeout 30; set cmd:fail-exit yes;'

# lftp with one script; quiet on success. The login stays out of argv except the user name.
remote() {
  lftp -c "$settings open --env-password -u \"$FTP_USER\" \"ftp://$FTP_HOST\"; $1"
}

# true when the path exists on the server
exists() {
  remote "cls -d \"$1\"" >/dev/null 2>&1
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
    if exists "$(under "$found" old/index.php)"; then
      echo "old/index.php: present (the old site is copied; upload is allowed)."
    else
      echo "old/index.php: missing (copy the old site into old/ before the first upload)."
    fi
    ;;

  dry-run)
    need_dir
    [ -f "$build/index.html" ] || { echo "No build in $build: run npm run build first." >&2; exit 1; }
    n=$(remote "mirror -R --dry-run --no-perms \"$build\" \"$dir\"" | grep -c '^put ' || true)
    echo "Dry run: an upload would send $n file(s) into the site folder; nothing is deleted."
    ;;

  upload)
    need_dir
    [ -f "$build/index.html" ] || { echo "No build in $build: run npm run build first." >&2; exit 1; }
    if ! exists "$(under "$dir" old/index.php)"; then
      echo "Refused: old/index.php is missing in the site folder. Copy the old site into old/ first (legacy-to-old workflow)." >&2
      exit 1
    fi
    # mirror -R never deletes on the server without --delete, which this script never passes
    remote "mirror -R --no-perms --parallel=4 \"$build\" \"$dir\""
    echo "Uploaded $(find "$build" -type f | wc -l | tr -d ' ') file(s); nothing on the server was deleted."
    ;;

  size)
    need_dir
    remote "du -s -m --exclude=old \"$dir\"" | awk '{ print "Site folder size without old/: " $1 " MB" }'
    ;;

  copy)
    need_dir
    if exists "$(under "$dir" old/index.php)"; then
      echo "old/index.php already exists: the old site was copied before; nothing to do."
      exit 0
    fi
    work="$(mktemp -d)"
    trap 'rm -rf "$work"' EXIT
    remote "mirror --no-perms --parallel=4 --exclude-glob old/ \"$dir\" \"$work/site\""
    echo "Downloaded $(find "$work/site" -type f | wc -l | tr -d ' ') file(s)."
    remote "mirror -R --no-perms --parallel=4 \"$work/site\" \"$(under "$dir" old)\""
    if exists "$(under "$dir" old/index.php)"; then
      echo "Copied into old/: old/index.php is present. Nothing was deleted."
    else
      echo "Copy finished but old/index.php is missing: check the server before uploading." >&2
      exit 1
    fi
    ;;

  *)
    echo "usage: tools/ftps.sh check|dry-run|upload|size|copy" >&2
    exit 2
    ;;
esac
