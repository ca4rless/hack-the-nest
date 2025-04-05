const path = require('path');
const fs = require('fs');
const poppler = require('pdf-poppler');
const sharp = require('sharp');

async function convertPdfToPng(pdfPath, outputDir = './output') {
    try {
        // Validate input
        if (!fs.existsSync(pdfPath)) {
            throw new Error(`PDF file not found at ${pdfPath}`);
        }

        const pdfName = path.basename(pdfPath, path.extname(pdfPath));
        
        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Convert PDF to PNGs (temporary files)
        const opts = {
            format: 'png',
            out_dir: outputDir,
            out_prefix: 'temp_',
            page: null // Convert all pages
        };

        await poppler.convert(pdfPath, opts);

        // Rename files to desired format
        const files = fs.readdirSync(outputDir);
        const tempFiles = files.filter(file => file.startsWith('temp_'));

        for (const [index, tempFile] of tempFiles.entries()) {
            const pageNumber = index + 1;
            const newName = `${pdfName} - ${pageNumber}.png`;
            const oldPath = path.join(outputDir, tempFile);
            const newPath = path.join(outputDir, newName);

            // Optional: Process image with sharp if needed
            await sharp(oldPath)
                .png({ quality: 100 })
                .toFile(newPath);

            // Remove temporary file
            fs.unlinkSync(oldPath);

            console.log(`Created: ${newName}`);
        }

        console.log(`All pages converted to PNG in ${outputDir}`);
    } catch (error) {
        console.error('Conversion error:', error);
    }
}

// Usage
convertPdfToPng('./document.pdf', './png-output');