#!/usr/bin/env python3
"""
Second pass: Fix all remaining < loading="lazy"> broken tag patterns.

These were originally <img> tags where the `img src="..."` part got corrupted,
leaving `< loading="lazy">` in place of `<img src="...filepath...`.

Patterns identified:
A) `< loading="lazy">  <img src="..."` → `<img src="..."` (orphan tag before valid img)
B) `< loading="lazy">"path"` → `<img src="path"` (lost `img src=`)
C) `< loading="lazy">roducts/X"` → `<img src="[prefix]products/X"` (lost `<img src="[pfx]p`)
D) `< loading="lazy">cts/X"` → `<img src="[prefix]products/X"` (lost `<img src="[pfx]produ`)
E) `< loading="lazy">ts/products/X"` → `<img src="[pfx]Assets/products/X"` (lost `<img src="[base]Asse`)
F) `< loading="lazy"> <other-tag/text>` → just remove the broken tag
"""

import os
import re
import glob

base_dir = "/Users/noz/Desktop/development/costaGlass"

html_files = list(set(
    glob.glob(os.path.join(base_dir, "**/*.html"), recursive=True) +
    glob.glob(os.path.join(base_dir, "*.html"))
))

def get_depth(fpath):
    """Return how many directory levels deep the file is from base_dir."""
    rel = os.path.relpath(fpath, base_dir)
    parts = rel.replace("\\", "/").split("/")
    return len(parts) - 1  # subtract the filename itself

def get_asset_prefix(depth):
    """Return the relative path to Assets/ based on directory depth."""
    if depth == 0:
        return "./Assets/"
    elif depth == 1:
        return "../Assets/"
    else:
        return "../../Assets/"

def fix_line(line, asset_prefix):
    # Pattern A/B: < loading="lazy"> (optional whitespace) <img → keep only <img
    line = re.sub(r'<\s+loading="lazy">\s*(<img\s)', r'\1', line)

    # Pattern C: < loading="lazy">"path..." → <img src="path..."
    line = re.sub(r'<\s+loading="lazy">"', '<img src="', line)

    # Pattern D: < loading="lazy">roducts/X → <img src="[prefix]products/X
    # (< loading="lazy"> replaced <img src="[prefix]p", leaving "roducts/X")
    line = re.sub(
        r'<\s+loading="lazy">roducts/',
        f'<img src="{asset_prefix}products/',
        line
    )

    # Pattern E: < loading="lazy">cts/X → <img src="[prefix]products/X
    # (< loading="lazy"> replaced <img src="[prefix]produ", leaving "cts/X")
    line = re.sub(
        r'<\s+loading="lazy">cts/',
        f'<img src="{asset_prefix}products/',
        line
    )

    # Pattern F: < loading="lazy">ts/products/X → <img src="[base]Assets/products/X
    # (< loading="lazy"> replaced <img src="[base]Asse", leaving "ts/products/X")
    asset_base = asset_prefix.replace("Assets/", "")  # e.g. "./" or "../../"
    line = re.sub(
        r'<\s+loading="lazy">ts/products/',
        f'<img src="{asset_base}Assets/products/',
        line
    )

    # Pattern G: remaining < loading="lazy"> before other content (section tags, divs, etc.)
    # Just strip the broken tag prefix, keep the rest of the line content
    line = re.sub(r'<\s+loading="lazy">\s*(?=<(?!img\b))', '', line)

    # Pattern H: < loading="lazy"> at end of line or only whitespace after
    line = re.sub(r'<\s+loading="lazy">\s*$', '', line)

    return line

fixed_files = []
errors = []

for fpath in sorted(html_files):
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        errors.append(f"READ ERROR {fpath}: {e}")
        continue

    if '< loading="lazy">' not in content:
        continue

    original = content
    depth = get_depth(fpath)
    asset_prefix = get_asset_prefix(depth)

    lines = content.split('\n')
    fixed_lines = [fix_line(line, asset_prefix) for line in lines]
    content = '\n'.join(fixed_lines)

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

# --- Verification ---
print("\n--- Final Verification ---")
remaining = []
for fpath in sorted(html_files):
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f, 1):
                if '< loading="lazy">' in line:
                    remaining.append(f"{os.path.relpath(fpath, base_dir)}:{i}: {line.strip()}")
    except:
        pass

if remaining:
    print(f"⚠️  Still found {len(remaining)} remaining issues:")
    for r in remaining[:20]:
        print(f"  {r}")
else:
    print("✅ No remaining < loading=\"lazy\"> broken tags!")
