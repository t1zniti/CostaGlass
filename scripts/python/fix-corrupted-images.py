#!/usr/bin/env python3
"""
Fix corrupted/overlapping img src attributes across all HTML files
Handles patterns like: <img src="./Ass<img src="..." 
"""

import os
import re
from pathlib import Path

def fix_corrupted_images(file_path):
    """
    Fix corrupted image tags in a single HTML file
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: Remove incomplete src attributes that precede complete ones
    # E.g., <img src="./Ass<img src="./Assets/..." becomes <img src="./Assets/..."
    content = re.sub(
        r'<img\s+src="[^"]*?<img\s+src="',
        '<img src="',
        content
    )
    
    # Pattern 2: Fix broken alt attributes with partial content
    # E.g., alt="Text<img src=... becomes just remove the duplicated img tag
    content = re.sub(
        r'alt="[^"]*?<img\s+src="',
        'alt="',
        content
    )
    
    # Pattern 3: Handle footer logo corruption (alt="Costa Glass"<img becomes alt="Costa Glass" class=)
    content = re.sub(
        r'alt="([^"]*?)"<img\s+src="[^"]*?"',
        r'alt="\1"',
        content
    )
    
    # Pattern 4: Clean up malformed tags with extra quotes or attributes in weird places
    # Match patterns like: >ías de Precios</span> that appear due to corruption
    content = re.sub(
        r'>\w+\s+de\s+\w+</span>',
        '>',
        content
    )
    
    # Pattern 5: Fix patterns like: loading="lazy">ías de Precios
    content = re.sub(
        r'(loading="lazy")>\w+\s+[^<]*?</span>',
        r'\1>',
        content
    )
    
    # Pattern 6: Remove dangling incomplete paths
    # E.g., "class="product-text fade-right"> that appear after corrupted img
    content = re.sub(
        r'loading="lazy">[a-z]*class="',
        'loading="lazy">\n                    <div class="',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """
    Fix all HTML files in the project
    """
    root_dir = Path('/Users/noz/Desktop/development/costaGlass')
    html_files = list(root_dir.glob('**/*.html'))
    
    fixed_count = 0
    
    for html_file in sorted(html_files):
        # Skip index files in node_modules or other non-content directories
        if 'node_modules' in str(html_file):
            continue
        
        try:
            if fix_corrupted_images(html_file):
                print(f"✓ Fixed: {html_file.relative_to(root_dir)}")
                fixed_count += 1
            else:
                print(f"  No changes needed: {html_file.relative_to(root_dir)}")
        except Exception as e:
            print(f"✗ Error processing {html_file.relative_to(root_dir)}: {e}")
    
    print(f"\n✓ Total files fixed: {fixed_count}")

if __name__ == '__main__':
    main()
