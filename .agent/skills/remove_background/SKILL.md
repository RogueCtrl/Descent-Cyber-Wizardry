---
description: Remove solid black background from an image using Node.js and Jimp
---

# Remove Background Skill

This skill allows you to programmatically remove a solid black background from an image by converting near-black pixels to transparent. It is useful for processing generated assets like logos that come with a black background.

## Dependencies

This skill requires the `jimp` npm package. Since this is a temporary processing utility, you should install it before use and uninstall it afterwards to keep the project clean.

## Usage

1.  **Install Dependency**:
    ```bash
    npm install jimp
    ```

2.  **Run the Script**:
    Run the `process_transparency.js` script located in this skill's `scripts/` directory.
    
    **Arguments:**
    - `input_path`: Path to the source image (e.g., `public/logo.png`)
    - `output_path`: Path to save the processed image (e.g., `assets/logo_transparent.png`)
    - `threshold` (optional): RGB threshold for identifying "black" pixels (default: 40). Pixels where R, G, and B are all less than this value will become transparent.

    **Example:**
    ```bash
    node .agent/skills/remove_background/scripts/process_transparency.js "public/raw_logo.png" "assets/gui/final_logo.png" 40
    ```

3.  **Cleanup**:
    Uninstall the dependency after you are done.
    ```bash
    npm uninstall jimp
    ```

## Notes

- The script assumes the project creates an ES Module environment (e.g., `"type": "module"` in `package.json`). If running in a CommonJS project, you may need to use dynamic imports or rename the script to `.mjs`.
- The threshold of 40 is good for removing compression artifacts in dark areas without eating into the actual content (unless the content is very dark).
