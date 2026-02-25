#!/usr/bin/env node

/**
 * Script to add loading="lazy" attribute to all img tags outside hero sections
 * Runs through all HTML files in the project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = __dirname;

// Classes/IDs that indicate above-the-fold/hero sections
const HERO_SELECTORS = [
  'hero',
  'hero-slide',
  'banner',
  'nav-logo',
  'header',
  'langToggle',
  'currentFlag',
  'lang-option',
  'footer-logo',
  'lang-flag',
];

/**
 * Check if an img tag is in a hero/above-the-fold section
 */
function isInHeroSection(htmlContent, imgTagIndex) {
  // Find the parent elements for this img tag
  const beforeImg = htmlContent.substring(0, imgTagIndex);
  
  // Check if any hero selectors are in the opening tags before this img
  for (const selector of HERO_SELECTORS) {
    const lastDivIndex = beforeImg.lastIndexOf('<div');
    const lastSectionIndex = beforeImg.lastIndexOf('<section');
    const lastHeaderIndex = beforeImg.lastIndexOf('<header');
    const lastNavIndex = beforeImg.lastIndexOf('<nav');
    
    const lastOpenTag = Math.max(lastDivIndex, lastSectionIndex, lastHeaderIndex, lastNavIndex);
    
    if (lastOpenTag !== -1) {
      const lastOpenTagContent = htmlContent.substring(lastOpenTag, imgTagIndex);
      
      // Check for hero classes or IDs
      if (lastOpenTagContent.includes(`class="hero`) ||
          lastOpenTagContent.includes(`class='hero`) ||
          lastOpenTagContent.includes(`id="hero`) ||
          lastOpenTagContent.includes(`id='hero`) ||
          lastOpenTagContent.includes(`class="*hero`) ||
          lastOpenTagContent.includes(`class="*banner`) ||
          lastOpenTagContent.includes(`class="nav-logo`) ||
          lastOpenTagContent.includes(`id="langToggle`) ||
          lastOpenTagContent.includes('class="footer-logo') ||
          lastOpenTagContent.includes('class="lang-flag') ||
          lastOpenTagContent.includes('class="lang-option')) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Process a single HTML file
 */
function processHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Regex to find img tags
    const imgRegex = /<img\s+([^>]*?)>/g;
    let match;
    let offset = 0;
    let modified = false;
    
    while ((match = imgRegex.exec(content)) !== null) {
      const fullTag = match[0];
      const attributes = match[1];
      const tagIndex = match.index;
      
      // Skip if already has loading attribute
      if (attributes.includes('loading=')) {
        continue;
      }
      
      // Check if it's in a hero section
      if (isInHeroSection(content, tagIndex)) {
        continue;
      }
      
      // Add loading="lazy" before the closing >
      const newTag = fullTag.replace(/\s*>$/, ' loading="lazy">');
      
      // Update content and offset
      content = content.substring(0, tagIndex + offset) + 
                newTag + 
                content.substring(tagIndex + offset + fullTag.length);
      
      offset += newTag.length - fullTag.length;
      modified = true;
    }
    
    // Write back if modified
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { modified: true, file: filePath };
    }
    
    return { modified: false, file: filePath };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { error: true, file: filePath, message: error.message };
  }
}

/**
 * Recursively find all HTML files
 */
function findHtmlFiles(dir) {
  let htmlFiles = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      // Skip common non-content directories
      if (['.git', 'node_modules', '.DS_Store', 'venv', '__pycache__'].includes(item)) {
        continue;
      }
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        htmlFiles = htmlFiles.concat(findHtmlFiles(fullPath));
      } else if (item.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return htmlFiles;
}

/**
 * Main function
 */
function main() {
  console.log('🖼️  Adding lazy loading to images...\n');
  
  const htmlFiles = findHtmlFiles(PROJECT_ROOT);
  
  if (htmlFiles.length === 0) {
    console.log('❌ No HTML files found in the project.');
    return;
  }
  
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  let modifiedCount = 0;
  let results = [];
  
  for (const file of htmlFiles) {
    const result = processHtmlFile(file);
    results.push(result);
    
    if (result.modified) {
      modifiedCount++;
      console.log(`✅ ${path.relative(PROJECT_ROOT, file)}`);
    } else if (!result.error) {
      console.log(`⏭️  ${path.relative(PROJECT_ROOT, file)} (no changes needed)`);
    }
  }
  
  console.log(`\n✨ Complete! Modified ${modifiedCount} file(s).`);
  
  // Summary
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} error(s) occurred:`);
    errors.forEach(e => console.log(`   - ${e.file}: ${e.message}`));
  }
}

main();
