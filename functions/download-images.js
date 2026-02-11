const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const IMAGES = [
    { name: 'bmw_x5.jpg', keywords: 'bmw,x5' },
    { name: 'mercedes_s_class.jpg', keywords: 'mercedes,s-class' },
    { name: 'audi_rs6.jpg', keywords: 'audi,rs6' },
    { name: 'porsche_911.jpg', keywords: 'porsche,911' },
    { name: 'toyota_rav4.jpg', keywords: 'toyota,rav4' },
    { name: 'vw_golf.jpg', keywords: 'volkswagen,golf' },
    { name: 'tesla_model_3.jpg', keywords: 'tesla,model3' },
    { name: 'bmw_m3.jpg', keywords: 'bmw,m3' },
    { name: 'mercedes_g_class.jpg', keywords: 'mercedes,g-wagon' },
    { name: 'audi_q8.jpg', keywords: 'audi,q8' },
    { name: 'ford_mustang.jpg', keywords: 'ford,mustang' },
    { name: 'range_rover.jpg', keywords: 'range,rover' },
    { name: 'porsche_cayenne.jpg', keywords: 'porsche,cayenne' },
    { name: 'honda_civic_type_r.jpg', keywords: 'honda,civic' },
    { name: 'lexus_rx.jpg', keywords: 'lexus,rx' },
    { name: 'nissan_gtr.jpg', keywords: 'nissan,gtr' },
    { name: 'volvo_xc90.jpg', keywords: 'volvo,xc90' },
    { name: 'bmw_i4.jpg', keywords: 'bmw,i4' },
    { name: 'mercedes_eqs.jpg', keywords: 'mercedes,eqs' },
    { name: 'audi_etron_gt.jpg', keywords: 'audi,etron' },
    { name: 'vw_arteon.jpg', keywords: 'volkswagen,arteon' },
    { name: 'skoda_superb.jpg', keywords: 'skoda,superb' },
    { name: 'peugeot_508.jpg', keywords: 'peugeot,508' },
    { name: 'alfa_romeo_giulia.jpg', keywords: 'alfa,romeo,giulia' },
    { name: 'jaguar_ftype.jpg', keywords: 'jaguar,ftype' },
    { name: 'mazda_mx5.jpg', keywords: 'mazda,mx5' },
    { name: 'subaru_wrx.jpg', keywords: 'subaru,wrx' },
    { name: 'toyota_supra.jpg', keywords: 'toyota,supra' },
    { name: 'ferrari_f8.jpg', keywords: 'ferrari,f8' },
    { name: 'lamborghini_urus.jpg', keywords: 'lamborghini,urus' },
    { name: 'rolls_royce_cullinan.jpg', keywords: 'rolls,royce' },
    { name: 'bentley_continental.jpg', keywords: 'bentley,continental' },
    { name: 'aston_martin_dbx.jpg', keywords: 'aston,martin,dbx' },
    { name: 'mclaren_720s.jpg', keywords: 'mclaren,720s' },
    { name: 'maserati_mc20.jpg', keywords: 'maserati,mc20' },
    { name: 'bugatti_chiron.jpg', keywords: 'bugatti,chiron' },
    { name: 'koenigsegg_jesko.jpg', keywords: 'supercar,koenigsegg' },
    { name: 'pagani_huayra.jpg', keywords: 'supercar,pagani' },
    { name: 'rimac_nevera.jpg', keywords: 'hypercar,electric' },
    { name: 'lotus_emira.jpg', keywords: 'lotus,emira' },
    { name: 'alpine_a110.jpg', keywords: 'alpine,a110' }
];

const DOWNLOAD_DIR = path.resolve(__dirname, '../public/assets/images/cars');

if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

async function downloadAll() {
    console.log(`🚀 Downloading ${IMAGES.length} images from LoremFlickr...`);

    for (const img of IMAGES) {
        const outputPath = path.join(DOWNLOAD_DIR, img.name);
        const url = `https://loremflickr.com/800/600/${img.keywords}`;

        // Use curl -L to follow redirects (LoremFlickr redirects to actual image)
        const command = `curl -L -A "Mozilla/5.0" -o "${outputPath}" "${url}"`;

        try {
            execSync(command, { stdio: 'ignore' });
            const stats = fs.statSync(outputPath);
            if (stats.size > 2000) {
                console.log(`✅ Saved ${img.name} (${(stats.size / 1024).toFixed(1)} KB)`);
            } else {
                console.warn(`⚠️ Warning: ${img.name} is small (${stats.size} bytes)`);
            }
        } catch (err) {
            console.error(`❌ Error downloading ${img.name}:`, err.message);
        }

        // Delay to be polite
        await new Promise(r => setTimeout(r, 100));
    }
}

downloadAll();
