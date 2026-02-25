#!/usr/bin/env python3
"""
Fix remaining footer glitch patterns - specifically the < cla< patterns.
"""

import re
import os

def fix_remaining_corruption(file_path):
    """Fix remaining corrupted patterns."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern: < cla<img src="..." pattern
    content = re.sub(
        r'< cla<img\s+src="([^"]*)"\s+alt="([^"]*)"\s+class="footer-logo">',
        r'<img src="\1" alt="\2" class="footer-logo">',
        content
    )
    
    # Also remove orphan < img tags with wrong attributes before correct ones
    content = re.sub(
        r'<img\s+src="[^"]*"\s+alt="[^"]*">\s*\n\s*< cla<img\s+src=',
        r'<img src=',
        content
    )
    
    # Pattern: orphan < img tags (just < without closing >)
    content = re.sub(
        r'< img\s+src="[^"]*"[^>]*>',
        r'',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """Process all HTML files."""
    html_files = []
    for root, dirs, files in os.walk('/Users/noz/Desktop/development/costaGlass'):
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next']]
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    fixed_files = []
    for file_path in sorted(html_files):
        if fix_remaining_corruption(file_path):
            fixed_files.append(file_path)
            print(f"✓ Fixed: {file_path}")
    
    print(f"\n{'='*60}")
    print(f"Fixed {len(fixed_files)} files")

if __name__ == '__main__':
    main()
