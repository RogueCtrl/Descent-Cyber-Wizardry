#!/usr/bin/env node

/**
 * process_transparency.js
 * 
 * Usage: node process_transparency.js <input_path> <output_path> [threshold=40]
 * 
 * Removes black background from an image by converting near-black pixels to transparent.
 * Requires 'jimp' package (v1.x recommended).
 */

import { Jimp } from "jimp";
import path from "path";
import fs from "fs";

const args = process.argv.slice(2);

if (args.length < 2) {
    console.error("Usage: node process_transparency.js <input_path> <output_path> [threshold]");
    process.exit(1);
}

const inputPath = path.resolve(args[0]);
const outputPath = path.resolve(args[1]);
const threshold = parseInt(args[2] || "40", 10);

if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found at ${inputPath}`);
    process.exit(1);
}

console.log(`Processing transparency for: ${inputPath}`);
console.log(`Output destination: ${outputPath}`);
console.log(`Black threshold: ${threshold}`);

try {
    const image = await Jimp.read(inputPath);

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        // Threshold for black background
        if (r < threshold && g < threshold && b < threshold) {
            this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
        }
    });

    await image.write(outputPath);
    console.log("Success! Transparent image saved.");
} catch (error) {
    console.error("Error processing image:", error);
    process.exit(1);
}
