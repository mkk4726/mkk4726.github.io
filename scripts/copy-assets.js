const fs = require('fs');
const path = require('path');

function copyAssets() {
  const sourceDir = path.join(process.cwd(), 'posts');
  // Change target to public/posts to match URL structure /posts/...
  const targetDir = path.join(process.cwd(), 'public/posts');
  
  let successCount = 0;
  let failCount = 0;
  const failedFiles = [];
  
  // Supported extensions
  const ASSET_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  const BLOCKED_EXTENSIONS = ['.pdf'];

  function removeBlockedAssets(target) {
    if (!fs.existsSync(target)) {
      return;
    }

    const items = fs.readdirSync(target);
    for (const item of items) {
      const targetPath = path.join(target, item);
      const stat = fs.statSync(targetPath);

      if (stat.isDirectory()) {
        removeBlockedAssets(targetPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (BLOCKED_EXTENSIONS.includes(ext)) {
          try {
            fs.unlinkSync(targetPath);
            successCount++;
          } catch (error) {
            failCount++;
            failedFiles.push({ source: targetPath, error: error.message });
          }
        }
      }
    }
  }
  
  function copyDirectory(source, target) {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }
    
    const items = fs.readdirSync(source);
    
    for (const item of items) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        // Recursively copy directories
        copyDirectory(sourcePath, targetPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (ASSET_EXTENSIONS.includes(ext)) {
          // Copy supported assets
          try {
            // Check if file needs updating (size or mtime) to avoid unnecessary writes
            let shouldCopy = true;
            if (fs.existsSync(targetPath)) {
              const targetStat = fs.statSync(targetPath);
              if (stat.mtime.getTime() <= targetStat.mtime.getTime() && stat.size === targetStat.size) {
                shouldCopy = false;
              }
            }

            if (shouldCopy) {
              fs.copyFileSync(sourcePath, targetPath);
              successCount++;
            }
          } catch (error) {
            failCount++;
            failedFiles.push({ source: sourcePath, error: error.message });
          }
        }
      }
    }
  }
  
  try {
    console.log(`📂 Copying assets from ${sourceDir} to ${targetDir}...`);
    console.log('🧹 Removing blocked assets from public/posts...');
    removeBlockedAssets(targetDir);
    copyDirectory(sourceDir, targetDir);
    
    // Output summary
    console.log(`✅ Assets copy completed: ${successCount} files copied/updated`);
    
    if (failCount > 0) {
      console.log(`❌ Assets copy failed: ${failCount} files failed`);
      failedFiles.forEach(({ source, error }) => {
        console.log(`   - ${path.basename(source)}: ${error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during assets copy:', error);
    process.exit(1);
  }
}

copyAssets();