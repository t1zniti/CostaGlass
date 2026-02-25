#!/usr/bin/env python3
"""
Remove duplicate/consecutive footer logo images.
"""

import re
import os

def remove_duplicate_footer_logos(file_path):
    """Remove duplicate footer logo img tags."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern: Two consecutive identical img tags with footer-logo class
    content = re.sub(
        r'<img\s+src="([^"]*)"\s+alt="([^"]*)"\s+class="footer-logo">\s*\n\s*<img\s+src="\1"\s+alt="\2"\s+class="footer-logo">',
        r'<img src="\1" alt="\2" class="footer-logo">',
        content
    )
    
    # Also handle case where first img doesn't have class but both have same src/alt
    content = re.sub(
        r'<img\s+src="([^"]*)"\s+alt="[^"]*">\s*\n\s*<img\s+src="\1"\s+alt="Costa Glass"\s+class="footer-logo">',
        r'<img src="\1" alt="Costa Glass" class="footer-logo">',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """Process all HTML files in the project."""
    html_files = []
    for root, dirs, files in os.walk('/Users/noz/Desktop/development/costaGlass'):
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next']]
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    fixed_files = []
    for file_path in sorted(html_files):
        if remove_duplicate_footer_logos(file_path):
            fixed_files.append(file_path)
            print(f"✓ Removed duplicate: {file_path}")
    
    print(f"\n{'='*60}")
    print(f"Fixed {len(fixed_files)} files")

if __name__ == '__main__':
    main()
