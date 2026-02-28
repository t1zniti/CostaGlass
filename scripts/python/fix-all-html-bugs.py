#!/usr/bin/env python3
"""
Fix two issues across all HTML files:
1. Language widget broken img tags: `< class="lang-flag" ...>` → proper <img> tags
2. Orphaned/broken img tags causing text on left: `< width="..." ...>` → remove them
"""

import os
import re
import glob

base_dir = "/Users/noz/Desktop/development/costaGlass"

html_files = glob.glob(os.path.join(base_dir, "**/*.html"), recursive=True)
html_files += glob.glob(os.path.join(base_dir, "*.html"))
# deduplicate
html_files = list(set(html_files))

fixed_files = []
errors = []

# Pattern 1: The main lang-flag toggle button - duplicated/broken tag
# Matches: <img src="...es.png" alt="..."> followed by < class="lang-flag" id="currentFlag"...>
# We want to replace both lines with one proper img tag

# Pattern 2: Orphaned broken tags in lang menu options  
# < width="40" height="27"> after a real <img src="..."> in lang options
# Just remove these lines

# Pattern 3: Orphaned broken product/hero image tags
# Lines like: `    < width="768" height="512" loading="lazy">` or `< loading="lazy">`
# These appear right after a real <img src="..."> tag
# Just remove these lines

# Regex: a line that is ONLY whitespace + `<` + space + attribute-like content + `>`
# i.e. not a real HTML tag (no tag name after `<`)
orphan_tag_pattern = re.compile(
    r'^\s*<\s+(?:class|width|height|loading|src|id|alt|style)=["\'][^"\']*["\'][^>]*>\s*$'
)

# For lang-flag: line like `< class="lang-flag" id="currentFlag" ...>` with no img/src
lang_flag_broken_pattern = re.compile(
    r'<\s+class="lang-flag"\s+id="currentFlag"([^>]*)>'
)

# Preceding duplicate vanilla img before broken lang-flag
# e.g. `<img src="https://flagcdn.com/w40/es.png" alt="Español">` immediately before the broken tag
es_flag_dupe_pattern = re.compile(
    r'<img\s+src="https://flagcdn\.com/w40/es\.png"\s+alt="[^"]*">\s*\n(\s*)<\s+class="lang-flag"\s+id="currentFlag"([^>]*)>'
)

for fpath in sorted(html_files):
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        errors.append(f"READ ERROR {fpath}: {e}")
        continue

    original = content

    # -----------------------------------------------------------------------
    # Fix 1: Replace the duplicated es flag + broken lang-flag tag combo
    # Pattern:
    #   <img src="https://flagcdn.com/w40/es.png" alt="...">
    #       < class="lang-flag" id="currentFlag"[optional attrs]>
    # Replace with single proper img tag
    # -----------------------------------------------------------------------
    def fix_lang_flag_with_dupe(m):
        indent = m.group(1)
        extra_attrs = m.group(2).strip()
        # Build proper tag
        if extra_attrs:
            # has width/height
            return f'<img src="https://flagcdn.com/w40/es.png" class="lang-flag" id="currentFlag" {extra_attrs} alt="Español">'
        else:
            return f'<img src="https://flagcdn.com/w40/es.png" class="lang-flag" id="currentFlag" width="40" height="27" alt="Español">'

    content = es_flag_dupe_pattern.sub(fix_lang_flag_with_dupe, content)

    # -----------------------------------------------------------------------
    # Fix 2: Fix remaining lone broken lang-flag tags (no preceding img dupe)
    # < class="lang-flag" id="currentFlag"...> → proper img tag
    # -----------------------------------------------------------------------
    def fix_lone_lang_flag(m):
        extra_attrs = m.group(1).strip()
        if extra_attrs:
            return f'<img src="https://flagcdn.com/w40/es.png" class="lang-flag" id="currentFlag" {extra_attrs} alt="Español">'
        else:
            return f'<img src="https://flagcdn.com/w40/es.png" class="lang-flag" id="currentFlag" width="40" height="27" alt="Español">'

    content = lang_flag_broken_pattern.sub(fix_lone_lang_flag, content)

    # -----------------------------------------------------------------------
    # Fix 3: Remove all orphaned broken img-like tags
    # These are lines like: `< width="768" height="512" loading="lazy">`
    # They appear as garbage text in the browser
    # -----------------------------------------------------------------------
    lines = content.split('\n')
    cleaned_lines = []
    for line in lines:
        if orphan_tag_pattern.match(line):
            # Skip this orphaned broken tag line
            continue
        cleaned_lines.append(line)
    content = '\n'.join(cleaned_lines)

    if content != original:
        try:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            rel = os.path.relpath(fpath, base_dir)
            fixed_files.append(rel)
        except Exception as e:
            errors.append(f"WRITE ERROR {fpath}: {e}")

print(f"\n✅ Fixed {len(fixed_files)} files:")
for f in fixed_files:
    print(f"  {f}")

if errors:
    print(f"\n❌ Errors ({len(errors)}):")
    for e in errors:
        print(f"  {e}")
else:
    print("\n✓ No errors encountered")

# -----------------------------------------------------------------------
# Verify: scan for remaining issues
# -----------------------------------------------------------------------
print("\n--- Verification ---")

remaining_broken = []
for fpath in sorted(html_files):
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            if orphan_tag_pattern.match(line):
                remaining_broken.append(f"{os.path.relpath(fpath, base_dir)}:{i}: {line.strip()}")
            if '< class="lang-flag"' in line:
                remaining_broken.append(f"{os.path.relpath(fpath, base_dir)}:{i}: {line.strip()}")
    except:
        pass

if remaining_broken:
    print(f"⚠️  Still found {len(remaining_broken)} remaining issues:")
    for r in remaining_broken[:20]:
        print(f"  {r}")
else:
    print("✅ No remaining broken tags found!")
