const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../bulgarian-car-marketplace/src');
const LOGGER_PATH = 'services/logger-service';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.match(/\.(ts|tsx|js|jsx)$/)) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function getRelativeImportPath(filePath, loggerPath) {
    const fileDir = path.dirname(filePath);
    const loggerAbsPath = path.join(SRC_DIR, loggerPath);
    let relativePath = path.relative(fileDir, loggerAbsPath);

    if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
    }

    return relativePath.replace(/\\/g, '/');
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;

    // Skip logger service itself
    if (filePath.includes('logger-service.ts')) {
        return;
    }

    // Skip files that already use logger heavily to avoid conflicts
    // or files that are scripts/configs
    if (filePath.includes('clean-google-auth.js')) {
        // Handle specifically or skip if manual fix preferred
        // Let's skip manual fix files for now and handle them separately if needed
        // But user wants 100%, so let's try to handle everything carefully
    }

    // Regex replacements
    // console.log -> logger.info
    if (content.match(/console\.log\s*\(/)) {
        content = content.replace(/console\.log\s*\(/g, 'logger.info(');
        hasChanges = true;
    }

    // console.error -> logger.error
    if (content.match(/console\.error\s*\(/)) {
        content = content.replace(/console\.error\s*\(/g, 'logger.error(');
        hasChanges = true;
    }

    // console.warn -> logger.warn
    if (content.match(/console\.warn\s*\(/)) {
        content = content.replace(/console\.warn\s*\(/g, 'logger.warn(');
        hasChanges = true;
    }

    // console.debug -> logger.debug
    if (content.match(/console\.debug\s*\(/)) {
        content = content.replace(/console\.debug\s*\(/g, 'logger.debug(');
        hasChanges = true;
    }

    if (hasChanges) {
        // Check if logger is already imported
        if (!content.includes('import { logger }') && !content.includes('import logger')) {
            const relativePath = getRelativeImportPath(filePath, LOGGER_PATH);
            const importStatement = `import { logger } from '${relativePath}';\n`;

            // Add import at the top
            // Try to add after existing imports
            const lastImportMatch = content.match(/import.*from.*;\n/g);

            if (lastImportMatch) {
                // Find the index of the last import
                const lastImportIndex = content.lastIndexOf('import');
                const endOfLastImport = content.indexOf('\n', lastImportIndex) + 1;
                content = content.slice(0, endOfLastImport) + importStatement + content.slice(endOfLastImport);
            } else {
                content = importStatement + content;
            }
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

const files = getAllFiles(SRC_DIR);
console.log(`Found ${files.length} files to scan.`);

files.forEach(file => {
    try {
        processFile(file);
    } catch (err) {
        console.error(`Error processing ${file}:`, err);
    }
});

console.log('Done replacing console.logs!');
