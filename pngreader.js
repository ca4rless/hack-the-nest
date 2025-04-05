const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

async function filterPngsToTextFile(pngDirectory, outputTextFile) {
    try {
        // Read and sort PNG files by page number
        const pngFiles = fs.readdirSync(pngDirectory)
            .filter(file => file.endsWith('.png'))
            .sort((a, b) => {
                const getPageNum = (filename) => parseInt(filename.match(/(\d+)\.png$/)[1]) || 0;
                return getPageNum(a) - getPageNum(b);
            });

        if (pngFiles.length === 0) {
            console.log('No PNG files found in directory');
            return;
        }

        console.log(`Processing ${pngFiles.length} PNG files...`);
        
        // Initialize output file
        fs.writeFileSync(outputTextFile, `OCR Results - Filtered\n\n`);

        let includedPages = 0;
        let excludedPages = 0;

        for (const [index, pngFile] of pngFiles.entries()) {
            const filePath = path.join(pngDirectory, pngFile);
            const pageNum = index + 1;

            console.log(`Analyzing ${pngFile}...`);

            try {
                // Perform OCR
                const { data: { text } } = await Tesseract.recognize(
                    filePath,
                    'eng',
                    { 
                        logger: m => console.log(m.status),
                        preserve_interword_spaces: true
                    }
                );

                // Check for 'EEE' in the text (case insensitive)
                const containsEEE = /EEE/i.test(text);

                if (containsEEE) {
                    console.log(`Excluding page ${pageNum} (contains 'EEE')`);
                    excludedPages++;
                    continue;
                }

                // If no EEE found, include the page
                const pageHeader = `=== Page ${pageNum} ===\n`;
                fs.appendFileSync(outputTextFile, pageHeader + text + '\n\n');
                includedPages++;
                console.log(`Included page ${pageNum}`);

            } catch (error) {
                console.error(`Error processing ${pngFile}:`, error.message);
                fs.appendFileSync(outputTextFile, `=== Page ${pageNum} === [PROCESSING ERROR]\n\n`);
            }
        }

        // Add summary
        const summary = `\n=== Summary ===
Total pages processed: ${pngFiles.length}
Pages included: ${includedPages}
Pages excluded (contained 'EEE'): ${excludedPages}\n`;

        fs.appendFileSync(outputTextFile, summary);
        console.log(`Completed! Results saved to ${outputTextFile}`);
        console.log(summary);

    } catch (error) {
        console.error('Error in filterPngsToTextFile:', error);
    }
}

// Example usage:
const pngDirectory = './converted-pngs'; // Directory with your PNG files
const outputTextFile = './filtered-output.txt'; // Output text file path

filterPngsToTextFile(pngDirectory, outputTextFile);