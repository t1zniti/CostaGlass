#!/usr/bin/env python3
"""
Advanced fix for remaining corrupted image tags
Handles edge cases like incomplete img tags missing opening tags
"""

import os
import re
from pathlib import Path

def fix_corrupted_images_v2(file_path):
    """
    More aggressive fix for remaining corruption patterns
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: Fix quoted paths without proper img tag opening
    # E.g., >"./Assets/..." becomes ><img src="./Assets/..."
    content = re.sub(
        r'>\s*"(\.\/Assets\/[^"]*?)"(\s+alt=)',
        r'><img src="\1"\2',
        content
    )
    
    # Pattern 2: Handle multiple img tags on same line with proper spacing/structure
    # When we have: <img ...>  <img ...> - keep both but ensure proper closing
    content = re.sub(
        r'(loading="lazy")\s+>\s+<img',
        r'\1>\n                    <img',
        content
    )
    
    # Pattern 3: Fix missing img tag when we see path between >   "
    # E.g., loading="lazy">      "<path> becomes two separate img tags
    content = re.sub(
        r'(loading="lazy")>\s+"(\.\/[^"]*)"',
        r'\1>\n                    <img src="\2"',
        content
    )
    
    # Pattern 4: Fix malformed closing where we have quote then path
    # > "./ should become > <img src="./
    content = re.sub(
        r'>\s+"(\.\/[A-Za-z])',
        r'>\n                    <img src="\1',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 5: Ensure closing tags for img elements that appear to be inline
    # If we have <img ... alt="..." but no closing >, add it
    content = re.sub(
        r'(<img\s+src="[^"]*?"\s+alt="[^"]*?")(\s+[a-z])',
        r'\1>\n                    <\2',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """
    Apply v2 fixes to files that still have issues
    """
    root_dir = Path('/Users/noz/Desktop/development/costaGlass')
    html_files = list(root_dir.glob('*.html'))
    html_files.extend(root_dir.glob('**/*/index.html'))
    html_files = sorted(set(html_files))  # Remove duplicates
    
    fixed_count = 0
    still_corrupted = []
    
    for html_file in html_files:
        if 'node_modules' in str(html_file):
            continue
        
        try:
            if fix_corrupted_images_v2(html_file):
                print(f"✓ Fixed (v2): {html_file.relative_to(root_dir)}")
                fixed_count += 1
            
            # Check if still has corruption
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if re.search(r'img src.*img src', content):
                    still_corrupted.append(str(html_file.relative_to(root_dir)))
        except Exception as e:
            print(f"✗ Error: {html_file.relative_to(root_dir)}: {e}")
    
    print(f"\n✓ Total files fixed (v2): {fixed_count}")
    
    if still_corrupted:
        print(f"\n⚠ Files still with mixed patterns ({len(still_corrupted)}):")
        for f in still_corrupted:
            print(f"  - {f}")
    else:
        print("\n✓ All files cleaned!")

if __name__ == '__main__':
    main()
