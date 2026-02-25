#!/usr/bin/env python3
"""
Fix footer logo HTML corruption where <img tags are broken with orphan '< alt=...' patterns.
"""

import re
import os

def fix_footer_corruption(file_path):
    """Fix footer logo corruptions in a single HTML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: < alt="Costa Glass" class="footer-logo" loading="lazy">de pérgolas...
    # This pattern has alt attribute already
    content = re.sub(
        r'< alt="Costa Glass" class="footer-logo"\s+loading="lazy">[^<]*</p>',
        r'<img src="./Assets/logo/download.webp" alt="Costa Glass" class="footer-logo">\n                    <p>Sistemas innovadores de pérgolas, techos corredizos y toldos zip. Diseño, confort y elegancia para sus espacios exteriores.</p>',
        content
    )
    
    # Pattern 2: < class="footer-logo" loading="lazy">chos corredizos y toldos zip...
    # This pattern is missing alt, and text is incomplete
    content = re.sub(
        r'< class="footer-logo"\s+loading="lazy">[^<]*</p>',
        r'<img src="./Assets/logo/download.webp" alt="Costa Glass" class="footer-logo">\n                    <p>Sistemas innovadores de pérgolas, techos corredizos y toldos zip. Diseño, confort y elegancia para sus espacios exteriores.</p>',
        content
    )
    
    # Pattern 3: < class="footer-logo" loading="lazy">      <p>Sistemas innovadores...
    # This has the text already in a <p> tag following
    content = re.sub(
        r'< class="footer-logo"\s+loading="lazy">\s+<p>',
        r'<img src="./Assets/logo/download.webp" alt="Costa Glass" class="footer-logo">\n                    <p>',
        content
    )
    
    # Pattern 4: < class="footer-logo" loading="lazy">Diseño, confort (without <p> wrapper)
    # Match partial text and add proper p tag
    content = re.sub(
        r'< class="footer-logo"\s+loading="lazy">Diseño, confort[^<]*</p>',
        r'<img src="./Assets/logo/download.webp" alt="Costa Glass" class="footer-logo">\n                    <p>Sistemas innovadores de pérgolas, techos corredizos y toldos zip. Diseño, confort y elegancia para sus espacios exteriores.</p>',
        content
    )
    
    # Pattern 5: Remove any remaining orphan < tags with class="footer-logo" that escaped above
    content = re.sub(
        r'< class="footer-logo"[^>]*>',
        r'',
        content
    )
    
    # Pattern 6: Clean up any remaining < alt="Costa Glass" class="footer-logo" orphans
    content = re.sub(
        r'< alt="Costa Glass" class="footer-logo"[^>]*>',
        r'',
        content
    )
    
    # Pattern 7: Handle duplicate img tags with wrong alt attribute (where alt is a path)
    # <img src="./Assets/logo/download.webp" alt="./Assets/logo/download.webp">
    # should become: <img src="./Assets/logo/download.webp" alt="Costa Glass" class="footer-logo">
    # But only if followed by footer content
    content = re.sub(
        r'<img\s+src="(\.?/?Assets/logo/download\.webp)"\s+alt="[^"]*">\s*\n\s*<img\s+src="([^"]*)"',
        r'<img src="\1" alt="Costa Glass" class="footer-logo">\n                    <img src="\2"',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """Process all HTML files in the project."""
    # Find all HTML files
    html_files = []
    for root, dirs, files in os.walk('/Users/noz/Desktop/development/costaGlass'):
        # Skip node_modules and other common ignore directories
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next']]
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    fixed_files = []
    for file_path in sorted(html_files):
        if fix_footer_corruption(file_path):
            fixed_files.append(file_path)
            print(f"✓ Fixed: {file_path}")
    
    print(f"\n{'='*60}")
    print(f"Fixed {len(fixed_files)} files")
    if fixed_files:
        print(f"\nFixed files:")
        for f in sorted(fixed_files):
            rel_path = f.replace('/Users/noz/Desktop/development/costaGlass/', '')
            print(f"  - {rel_path}")

if __name__ == '__main__':
    main()
