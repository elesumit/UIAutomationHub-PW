# 🌐 Web Test Creator - Setup Guide

## Overview

This tool allows manual testers to create Playwright tests **without any local setup**. They only need a web browser!

**Workflow:**
1. Tester fills Excel template
2. Uploads to web UI
3. Tool converts to Gherkin
4. Automatically commits to GitHub
5. Test is ready to run from Jira

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `@octokit/rest` - GitHub API
- `multer` - File upload handling
- `xlsx` - Excel parsing
- `express` - Web server

### Step 2: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: `Test Creator Token`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

### Step 3: Set Environment Variables

**Windows (PowerShell):**
```powershell
$env:GITHUB_TOKEN="your_github_token_here"
$env:GITHUB_OWNER="veradigm-project-atlas"
$env:GITHUB_REPO="Testing-Automation-PlayWright"
$env:GITHUB_BRANCH="main"
```

**Windows (Command Prompt):**
```cmd
set GITHUB_TOKEN=your_github_token_here
set GITHUB_OWNER=veradigm-project-atlas
set GITHUB_REPO=Testing-Automation-PlayWright
set GITHUB_BRANCH=main
```

**Linux/Mac:**
```bash
export GITHUB_TOKEN="your_github_token_here"
export GITHUB_OWNER="veradigm-project-atlas"
export GITHUB_REPO="Testing-Automation-PlayWright"
export GITHUB_BRANCH="main"
```

### Step 4: Start the Server

```bash
npx ts-node tools/web-test-creator/server.ts
```

You should see:
```
🚀 Web Test Creator Server Running!

📝 Open in browser: http://localhost:3000

Configuration:
  - GitHub Repo: veradigm-project-atlas/Testing-Automation-PlayWright
  - Branch: main
  - Token Configured: ✅ Yes
```

### Step 5: Access from Browser

**On your machine:**
- Open: http://localhost:3000

**From other machines (testers):**
1. Get your IP address:
   ```bash
   ipconfig  # Windows
   ifconfig  # Linux/Mac
   ```
2. Share URL with testers: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

---

## 📝 How Testers Use It

### Step 1: Download Template
1. Open the web UI
2. Click **"Download Excel Template"**
3. Save the file

### Step 2: Fill in Test Steps
Open the Excel file and fill in:
- **Column A:** Test Case ID (e.g., BTC-201)
- **Column B:** Scenario Name
- **Column C:** Tags (@smoke, @regression)
- **Column D:** Action (Open, Click, Type, Choose, Check)
- **Column E:** What to Click/Enter
- **Column F:** Value (if typing text)

**Example:**
```
Test Case ID | Scenario Name | Tags          | Action | What to Click/Enter | Value
BTC-201      | Login Test    | @smoke        | Open   | CE Portal          |
             |               |               | Click  | Log in button      |
             |               |               | Type   | Username field     | admin
             |               |               | Click  | Continue button    |
```

### Step 3: Upload to Web UI
1. Go back to the web UI
2. Drag & drop the Excel file (or click "Choose File")
3. Click **"Upload & Save to GitHub"**
4. Wait for success message

### Step 4: Run from Jira
1. Go to Jira
2. Create Test Execution with your test case (e.g., BTC-201)
3. Test runs automatically via GitHub Actions
4. Results appear in Jira

**That's it! No Playwright, no Node.js, no Git needed on tester's machine!**

---

## 🔧 Production Deployment

### Option 1: Run on Your Machine (Testing)

Good for initial testing with 1-2 testers.

```bash
npx ts-node tools/web-test-creator/server.ts
```

**Pros:** Quick setup  
**Cons:** Only works when your machine is on

### Option 2: Deploy to Company Server (Recommended)

For production use with multiple testers.

**On Windows Server:**
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start tools/web-test-creator/server.ts --name test-creator --interpreter ts-node

# Set environment variables in PM2
pm2 set test-creator GITHUB_TOKEN your_token_here

# Auto-start on reboot
pm2 startup
pm2 save
```

**On Linux Server:**
```bash
# Install PM2
sudo npm install -g pm2

# Start server
pm2 start tools/web-test-creator/server.ts --name test-creator --interpreter ts-node

# Set environment variables
pm2 set test-creator GITHUB_TOKEN your_token_here

# Auto-start on reboot
pm2 startup
pm2 save
```

**Access URL:** `http://server-ip:3000`

### Option 3: Use .env File (Easier)

Create `.env` file in project root:
```
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=veradigm-project-atlas
GITHUB_REPO=Testing-Automation-PlayWright
GITHUB_BRANCH=main
```

Then start server:
```bash
npx ts-node tools/web-test-creator/server.ts
```

---

## 🔒 Security Considerations

### For Internal Network Only

1. **Firewall:** Only allow access from internal IPs
2. **VPN:** Require VPN for remote access
3. **No Public Internet:** Don't expose to public internet

### Optional: Add Authentication

If you need user authentication, you can add basic auth using nginx:

```nginx
server {
    listen 80;
    server_name test-creator.company.com;
    
    auth_basic "Test Creator";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

---

## 🐛 Troubleshooting

### "GitHub token not configured"
- Make sure `GITHUB_TOKEN` environment variable is set
- Restart the server after setting the variable

### "Failed to commit to GitHub"
- Check token has `repo` permissions
- Verify `GITHUB_OWNER` and `GITHUB_REPO` are correct
- Ensure you have write access to the repository

### "Cannot find module"
- Run `npm install` to install dependencies
- Make sure you're in the project root directory

### Testers can't access the URL
- Check firewall allows port 3000
- Verify server is running: `netstat -an | findstr 3000`
- Make sure you're using the correct IP address

### File upload fails
- Check file is .xlsx, .xls, or .csv format
- Ensure file follows the template structure
- Check server logs for detailed error

---

## 📊 Monitoring

### Check Server Status
```bash
pm2 status
pm2 logs test-creator
```

### View Recent Commits
Check GitHub repository to see uploaded tests:
https://github.com/veradigm-project-atlas/Testing-Automation-PlayWright/commits/main

---

## 🎯 Benefits

✅ **No local setup** - Testers only need a browser  
✅ **Automatic GitHub commits** - No manual git commands  
✅ **Instant availability** - Tests ready to run immediately  
✅ **Familiar Excel interface** - Easy for manual testers  
✅ **Integrated workflow** - Works with existing Jira/GitHub setup  

---

## 📞 Support

For issues or questions:
1. Check this README
2. Check server logs: `pm2 logs test-creator`
3. Contact automation team

---

**Ready to test! 🚀**
