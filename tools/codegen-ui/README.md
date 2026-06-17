# 🎬 Codegen UI - Quick Start Guide

## How to Use (Simple 5-Step Process)

### Step 1: Start the Server
```bash
npx ts-node tools/codegen-ui/server.ts
```

Open browser: http://localhost:3000

### Step 2: Fill in Test Details
- **Test Case ID:** BTC-201
- **Scenario Name:** Create Case
- **Starting URL:** https://qa.customerexperience.veradigm.com
- **Tags:** @smoke, @regression

### Step 3: Record Your Test
1. Click **"Start Recording"**
2. A browser window + Playwright Inspector will open
3. **Perform your test actions** in the browser
4. **Watch the code appear** in the Playwright Inspector (right panel)

### Step 4: Copy the Code
1. In the **Playwright Inspector window**, select all the code (Ctrl+A)
2. Copy it (Ctrl+C)
3. Return to the web UI (http://localhost:3000)
4. Click **"Stop Recording"**
5. **Paste the code** into the "Recorded Playwright Code" textarea (Ctrl+V)

### Step 5: Convert & Save
1. Click **"Convert to Gherkin"**
2. Review the generated steps
3. Click **"Save Feature File"**
4. Done! Your test is saved to `features/` folder

---

## Why Do I Need to Copy/Paste?

Playwright Codegen shows code in a GUI Inspector window, not in the terminal. Our tool can't automatically capture it, so you need to manually copy it from the Inspector and paste it into the web UI.

---

## Alternative: Use Excel Converter Instead

If the copy/paste workflow feels too manual, consider using the **Excel to Gherkin Converter** instead:

1. Write your test steps in Excel (see `tools/test-case-template.csv`)
2. Run: `npx ts-node tools/excel-to-gherkin.ts your-test.csv features`
3. Done! No recording or copy/paste needed.

---

## Tips

✅ **Go slow** - Wait for pages to load between actions  
✅ **Use clear names** - Click on buttons with clear text  
✅ **Review before saving** - Check the generated Gherkin makes sense  
✅ **Test immediately** - Run the test right after creating it  

---

## Troubleshooting

**Q: Inspector window doesn't open?**  
A: Run `npx playwright install chromium`

**Q: Code in Inspector looks wrong?**  
A: You can manually edit it before pasting into the web UI

**Q: Conversion fails?**  
A: The converter expects standard Playwright code. Complex custom code may not convert properly.

---

**For most users, we recommend the Excel Converter for easier test creation!**
