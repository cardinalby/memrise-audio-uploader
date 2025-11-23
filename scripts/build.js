// move to extension contents to build/dist after src processing:
// 1. parse manifest.json and find "#include_if" directives:
// - #include_if CHROME_BUILD
// - #include_if FIREFOX_BUILD
// - #include_if !FIREFOX_BUILD
// - #include_if !CHROME_BUILD
// 2. for each directive, check if the build target matches and expand contents of the directive
//    to the object
// 3. write the processed manifest.json to build/dist/manifest.json
// 4. copy all other files from extension to build/dist checking if they have any "#include_if" directives
//    and processing them the same way as manifest.json

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let buildTarget = 'CHROME_BUILD'; // default

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' && i + 1 < args.length) {
        const target = args[i + 1].toUpperCase();
        if (target === 'CHROME' || target === 'CHROME_BUILD') {
            buildTarget = 'CHROME_BUILD';
        } else if (target === 'FIREFOX' || target === 'FIREFOX_BUILD') {
            buildTarget = 'FIREFOX_BUILD';
        }
    }
}

console.log(`Building for: ${buildTarget}`);

const extensionDir = path.join(__dirname, '..', 'extension');
const buildDir = path.join(__dirname, '..', 'build', 'dist');

// Clean build directory first
if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
}

// Create build directory
fs.mkdirSync(buildDir, { recursive: true });

/**
 * Check if a directive matches the current build target
 * @param {string} directive - e.g., "CHROME_BUILD", "!FIREFOX_BUILD"
 * @param {string} target - current build target
 * @returns {boolean}
 */
function matchesTarget(directive, target) {
    if (directive.startsWith('!')) {
        return directive.slice(1) !== target;
    }
    return directive === target;
}

/**
 * Process JSON object and expand #include_if directives
 * @param {any} obj - JSON object to process
 * @param {string} target - current build target
 * @returns {any}
 */
function processJsonObject(obj, target) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => processJsonObject(item, target));
    }

    const result = {};
    for (const key of Object.keys(obj)) {
        if (key.startsWith('#include_if ')) {
            const directive = key.replace('#include_if ', '').trim();
            if (matchesTarget(directive, target)) {
                // Expand the contents of this directive into the parent object
                const value = obj[key];
                if (typeof value === 'object' && !Array.isArray(value)) {
                    Object.assign(result, processJsonObject(value, target));
                } else {
                    // If it's not an object, we can't expand it
                    result[key] = processJsonObject(value, target);
                }
            }
            // If directive doesn't match, skip this key entirely
        } else {
            result[key] = processJsonObject(obj[key], target);
        }
    }
    return result;
}

/**
 * Process JavaScript/text file and handle #include_if directives
 * @param {string} content - file content
 * @param {string} target - current build target
 * @returns {string|null} processed content or null if file should be excluded
 */
function processTextFile(content, target) {
    const lines = content.split('\n');

    // Check if the first non-empty line is an #include_if directive
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed === '') continue; // Skip empty lines

        const includeIfMatch = trimmed.match(/^\/\/\s*#include_if\s+(.+)$/);
        if (includeIfMatch) {
            const directive = includeIfMatch[1].trim();
            if (!matchesTarget(directive, target)) {
                // Exclude the entire file
                return null;
            }
            // Include the file, but remove the directive line
            return lines.slice(i + 1).join('\n');
        }

        // First non-empty line is not a directive, process normally
        break;
    }

    return content;
}

/**
 * Copy directory recursively with processing
 * @param {string} src - source directory
 * @param {string} dest - destination directory
 */
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else if (entry.isFile()) {
            copyFile(srcPath, destPath);
        }
    }
}

/**
 * Copy and process a single file
 * @param {string} src - source file path
 * @param {string} dest - destination file path
 */
function copyFile(src, dest) {
    const ext = path.extname(src).toLowerCase();

    if (ext === '.json') {
        // Process JSON files
        const content = fs.readFileSync(src, 'utf8');
        try {
            const json = JSON.parse(content);
            const processed = processJsonObject(json, buildTarget);
            fs.writeFileSync(dest, JSON.stringify(processed, null, 4));
            console.log(`Processed: ${path.relative(extensionDir, src)}`);
        } catch (e) {
            console.error(`Error processing JSON file ${src}:`, e.message);
            fs.copyFileSync(src, dest);
        }
    } else if (ext === '.js' || ext === '.css' || ext === '.html') {
        // Process text files that might contain directives
        const content = fs.readFileSync(src, 'utf8');
        const processed = processTextFile(content, buildTarget);
        if (processed === null) {
            // File should be excluded based on #include_if directive
            console.log(`Excluded: ${path.relative(extensionDir, src)}`);
            return;
        }
        fs.writeFileSync(dest, processed);
        console.log(`Processed: ${path.relative(extensionDir, src)}`);
    } else {
        // Copy binary files as-is
        fs.copyFileSync(src, dest);
        console.log(`Copied: ${path.relative(extensionDir, src)}`);
    }
}


// Copy and process all files
copyDir(extensionDir, buildDir);

console.log(`\nBuild completed successfully!`);
console.log(`Output directory: ${buildDir}`);
