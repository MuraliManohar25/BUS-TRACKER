/**
 * Script to extract and analyze the reference design zip file
 * Run: node scripts/extract-reference.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const zipPath = path.join(__dirname, '..', 'stitch_home_screen.zip');
const extractPath = path.join(__dirname, '..', 'reference-design');

function extractZip() {
  try {
    if (!fs.existsSync(zipPath)) {
      console.error('❌ Zip file not found at:', zipPath);
      console.log('Please place stitch_home_screen.zip in the project root directory');
      return false;
    }

    // Create extract directory
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    // Extract zip (requires unzip or 7zip on Windows)
    console.log('Extracting zip file...');
    
    // Try using PowerShell's Expand-Archive
    try {
      execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractPath}' -Force"`, {
        stdio: 'inherit'
      });
      console.log('✅ Extraction successful!');
      analyzeContents();
      return true;
    } catch (error) {
      console.error('Error extracting:', error.message);
      console.log('Please extract the zip manually and place contents in:', extractPath);
      return false;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

function analyzeContents() {
  console.log('\n📁 Analyzing extracted contents...\n');
  
  function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath, fileList);
      } else {
        fileList.push({
          path: path.relative(extractPath, filePath),
          size: stat.size,
          ext: path.extname(file).toLowerCase()
        });
      }
    });
    
    return fileList;
  }
  
  const files = walkDir(extractPath);
  
  console.log('📄 Files found:');
  files.forEach(file => {
    console.log(`  - ${file.path} (${file.size} bytes, ${file.ext})`);
  });
  
  // Group by type
  const htmlFiles = files.filter(f => f.ext === '.html');
  const cssFiles = files.filter(f => f.ext === '.css');
  const jsFiles = files.filter(f => f.ext === '.js' || f.ext === '.jsx');
  const imageFiles = files.filter(f => ['.png', '.jpg', '.jpeg', '.svg', '.gif'].includes(f.ext));
  
  console.log('\n📊 Summary:');
  console.log(`  HTML: ${htmlFiles.length} files`);
  console.log(`  CSS: ${cssFiles.length} files`);
  console.log(`  JavaScript: ${jsFiles.length} files`);
  console.log(`  Images: ${imageFiles.length} files`);
  
  // Save analysis
  const analysis = {
    totalFiles: files.length,
    htmlFiles: htmlFiles.map(f => f.path),
    cssFiles: cssFiles.map(f => f.path),
    jsFiles: jsFiles.map(f => f.path),
    imageFiles: imageFiles.map(f => f.path),
    allFiles: files
  };
  
  fs.writeFileSync(
    path.join(extractPath, 'analysis.json'),
    JSON.stringify(analysis, null, 2)
  );
  
  console.log('\n✅ Analysis saved to:', path.join(extractPath, 'analysis.json'));
}

if (require.main === module) {
  extractZip();
}

module.exports = { extractZip, analyzeContents };

