import fs from 'fs';

function analyzeBMWPage() {
    try {
        const content = fs.readFileSync('bmw-page.html', 'utf8');
        const lines = content.split('\n');

        console.log('🔍 Looking for BMW model listings:\n');

        let modelCount = 0;
        lines.forEach((line, i) => {
            if (modelCount < 30 && line.includes('BMW') && line.includes('20') &&
                (line.includes('href=') || line.includes('title='))) {
                console.log(`${(i+1).toString().padStart(4)}: ${line.trim()}`);
                modelCount++;
            }
        });

        console.log(`\n📊 Found ${modelCount} BMW model references`);

        // Look for pagination or "show more" links
        console.log('\n🔍 Looking for pagination:');
        lines.forEach((line, i) => {
            if (line.includes('more') || line.includes('next') || line.includes('page') ||
                line.includes('SHOW') || line.includes('load')) {
                console.log(`${(i+1).toString().padStart(4)}: ${line.trim()}`);
            }
        });

    } catch (error) {
        console.error('Error analyzing BMW page:', error.message);
    }
}

analyzeBMWPage();