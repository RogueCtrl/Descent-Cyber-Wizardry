const Jimp = require("jimp");

console.log("Processing logo transparency...");

Jimp.read("public/temp_logo.png")
    .then(image => {
        // Scan every pixel
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // Threshold for black background
            // Using < 40 to catch compression artifacts near text edges
            if (r < 40 && g < 40 && b < 40) {
                this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
            }
        });

        // Save the result
        return image.writeAsync("assets/gui/game_logo.png");
    })
    .then(() => {
        console.log("Success! Transparent logo saved to assets/gui/game_logo.png");
    })
    .catch(err => {
        console.error("Error processing logo:", err);
        process.exit(1);
    });
