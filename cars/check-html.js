import fs from 'fs';

function analyzeHTML() {
    try {
        const content = fs.readFileSync('netcarshow-homepage.html', 'utf8');
        const lines = content.split('\n');

        console.log('🔍 First 100 lines of NetCarShow HTML:\n');

        for (let i = 0; i < Math.min(100, lines.length); i++) {
            const line = lines[i].trim();
            if (line.includes('<a') || line.includes('href') || line.includes('brand') || line.includes('make')) {
                console.log(`${(i+1).toString().padStart(3)}: ${line}`);
            }
        }

        console.log('\n🔍 Looking for brand sections...');

        // Look for sections that might contain brands
        const brandSections = content.match(/<div[^>]*>[\s\S]*?<\/div>/g) || [];
        console.log(`Found ${brandSections.length} div sections`);

        // Look for lists or menus
        const lists = content.match(/<ul[^>]*>[\s\S]*?<\/ul>/g) || [];
        console.log(`Found ${lists.length} ul lists`);

        // Look for brand names in the content
        const brandNames = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Volkswagen'];
        console.log('\n🔍 Checking for known brand names:');
        brandNames.forEach(brand => {
            if (content.includes(brand)) {
                console.log(`✅ ${brand} found in HTML`);
            } else {
                console.log(`❌ ${brand} not found in HTML`);
            }
        });

    } catch (error) {
        console.error('Error analyzing HTML:', error.message);
    }
}

analyzeHTML();