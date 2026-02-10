import json
from datetime import datetime

with open('data/research.json', 'r') as f:
    data = json.load(f)

new_note = {
    "id": "note-036",
    "title": "Higgsfield AI Image Generation Automation - Test Results & UI Mapping",
    "date": "2026-02-10T20:00:00Z",
    "tags": ["automation", "higgsfield", "image-generation", "playwright", "testing"],
    "content": "# Higgsfield AI Image Generation Automation - Test Results\n\n## Summary\nSuccessfully mapped Higgsfield AI image generation UI for automated batch processing. Script connects via Chrome DevTools Protocol (CDP) to existing logged-in browser session.\n\n## UI Elements Identified\n\n### 1. Navigation\n- URL: https://higgsfield.ai/create-image\n- Login verification: Check for \"Personal\" workspace button\n\n### 2. Model Selection\n- Default: Higgsfield Soul\n- Target: Nano Banana Pro (for 4K image quality)\n- Selector: button with text \"Higgsfield Soul\" → click → select \"Nano Banana Pro\"\n\n### 3. Prompt Input\n- Element: textbox with accessible name \"Upload image as a prompt or Describe the scene you imagine\"\n- Method: get_by_role(\"textbox\", name=...)\n- Note: Field accepts both text and image uploads\n\n### 4. Reference Image Upload\n- Button: Image icon button inside prompt input area (first button before textbox)\n- Workflow: Click → expect_file_chooser() → set_files(image_path)\n- Upload time: ~3 seconds\n\n### 5. Aspect Ratio\n- Default: 3:4\n- Target: 16:9 (for YouTube/video content)\n- Selector: button with current ratio text → opens listbox dialog\n- Options: 9:16, 3:4, 2:3, 1:1, 4:3, 16:9, 3:2\n\n### 6. Generate Button\n- Text: \"Generate 2\" (when unlimited mode active)\n- Selector: button:has-text(\"Generate\")\n\n### 7. Unlimited Mode Toggle\n- Located near \"Unlim\" text\n- Type: Switch/toggle button\n\n## Technical Implementation\n\n### Browser Connection\n```python\nbrowser = p.chromium.connect_over_cdp(\"http://localhost:18800\")\n```\n- Uses OpenClaw-managed Chrome profile (pre-authenticated)\n- Maintains login state across sessions\n- CDP port configured in config.yaml\n\n### Automation Script Status\n- ✅ CSV parsing (4 shots, 24 prompts for Scene 1 test)\n- ✅ Folder structure creation\n- ✅ Browser connection via CDP\n- ✅ Login verification\n- ✅ Model selection\n- ✅ Prompt entry\n- ⏳ Reference image upload (in testing)\n- ⏳ Aspect ratio selection\n- ⏳ Unlimited mode toggle\n- ⏳ Generate button click\n- ⏳ Image download\n\n## Project Configuration\n\n### Test CSV Structure\n- Scene #: 1\n- Scene Title: The Egg\n- Line: Opening/Hatching/First Look/Bonding\n- Shot #: 1.1, 1.2, 1.3, 1.4\n- Prompts A-F per shot (24 total generations)\n\n## Next Steps\n1. Complete upload_reference_image() method testing\n2. Fix aspect ratio dropdown selection\n3. Verify unlimited mode toggle\n4. Test full generation workflow\n5. Add retry logic for failed generations\n6. Implement batch processing with concurrency control",
    "sourceUrls": ["https://higgsfield.ai/create-image"],
    "category": "Technical Documentation",
    "linkedYouTubeIds": [],
    "confidence": 85,
    "auditScore": None,
    "auditorNotes": "Pending full workflow test completion"
}

data['notes'].append(new_note)

with open('data/research.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Added note-036 to research.json")
