#!/bin/sh

set -eu

umask 077

SCRIPT_DIR=$(CDPATH= cd -P "$(dirname "$0")" && pwd)
PROFILE_DIR=$SCRIPT_DIR
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
OUTPUT_DIR="$PROFILE_DIR/firefox-config-$TIMESTAMP"
COPIED_COUNT=0
MISSING_COUNT=0

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

[ -f "$PROFILE_DIR/prefs.js" ] || fail "prefs.js was not found next to this script. Copy the script into a Firefox profile directory first."

if command -v pgrep >/dev/null 2>&1 && pgrep -f '/Firefox\.app/Contents/MacOS/firefox|(^|/)firefox( |$)' >/dev/null 2>&1; then
  fail "Firefox is running. Close it before exporting."
fi

if [ -e "$OUTPUT_DIR" ]; then
  OUTPUT_DIR="$OUTPUT_DIR-$$"
fi

mkdir -p "$OUTPUT_DIR"

copy_path() {
  relative_path=$1
  source_path="$PROFILE_DIR/$relative_path"
  target_path="$OUTPUT_DIR/$relative_path"

  if [ ! -e "$source_path" ] && [ ! -L "$source_path" ]; then
    printf 'Missing: %s\n' "$relative_path"
    MISSING_COUNT=$((MISSING_COUNT + 1))
    return 0
  fi

  mkdir -p "$(dirname "$target_path")"
  cp -Rp "$source_path" "$target_path"
  printf 'Copied:  %s\n' "$relative_path"
  COPIED_COUNT=$((COPIED_COUNT + 1))
}

copy_filtered_prefs() {
  awk '
    /^user_pref\("browser\.pageActions\.persistedActions",/ ||
    /^user_pref\("browser\.toolbars\.bookmarks\.visibility",/ ||
    /^user_pref\("browser\.uiCustomization\.state",/ ||
    /^user_pref\("extensions\.webextensions\.uuids",/ ||
    /^user_pref\("sidebar\.installed\.extensions",/ ||
    /^user_pref\("sidebar\.main\.tools",/ ||
    /^user_pref\("sidebar\.position_start",/ ||
    /^user_pref\("sidebar\.visibility",/ ||
    /^user_pref\("toolkit\.legacyUserProfileCustomizations\.stylesheets",/ {
      print
    }
  ' "$PROFILE_DIR/prefs.js" > "$OUTPUT_DIR/prefs.js"

  printf 'Copied:  prefs.js [filtered]\n'
  COPIED_COUNT=$((COPIED_COUNT + 1))
}

printf 'Exporting Firefox configuration...\n\n'

copy_filtered_prefs

for relative_path in \
  xulstore.json \
  search.json.mozlz4 \
  user.js \
  chrome \
  extension-settings.json \
  extension-preferences.json \
  extension-store
do
  copy_path "$relative_path"
done

for xpi_path in "$PROFILE_DIR"/extensions/*.xpi; do
  [ -e "$xpi_path" ] || continue
  copy_path "extensions/$(basename "$xpi_path")"
done

for storage_path in "$PROFILE_DIR"/storage/default/moz-extension+++*; do
  [ -d "$storage_path" ] || continue
  copy_path "storage/default/$(basename "$storage_path")"
done

for storage_path in "$PROFILE_DIR"/storage/permanent/moz-extension+++*; do
  [ -d "$storage_path" ] || continue
  copy_path "storage/permanent/$(basename "$storage_path")"
done

printf '\nExport complete.\n'
printf 'Directory: %s\n' "$OUTPUT_DIR"
printf 'Copied: %s\n' "$COPIED_COUNT"
printf 'Missing optional: %s\n' "$MISSING_COUNT"
printf 'Warning: Add-on local data may contain tokens or other secrets.\n'
