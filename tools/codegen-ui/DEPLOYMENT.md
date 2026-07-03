# 🚀 Codegen UI Deployment Guide

## Deployment Options

### Option 1: Local on Each Tester's Machine (Simplest)

**Best for:** Small teams, quick setup

Each tester runs the server on their own computer.

**Setup:**
```bash
# Tester opens terminal and runs:
cd path/to/project
npx ts-node tools/codegen-ui/server.ts
```

**Access:** http://localhost:3000

**Pros:**
- ✅ No server setup needed
- ✅ Works offline
- ✅ No network configuration

**Cons:**
- ❌ Each tester needs Node.js installed
- ❌ Must run command each time

---

### Option 2: Shared Server (Recommended for Teams)

**Best for:** Multiple testers, centralized access

Host on a shared Windows/Linux server that all testers can access.

#### **Windows Server Setup:**

1. **Install Node.js on the server:**
   - Download from: https://nodejs.org/
   - Install LTS version

2. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Automation-PW
   npm install
   ```

3. **Run as a Windows Service (using PM2):**
   ```bash
   # Install PM2 globally
   npm install -g pm2

   # Start the server
   pm2 start tools/codegen-ui/server.ts --name codegen-ui --interpreter ts-node

   # Make it auto-start on reboot
   pm2 startup
   pm2 save
   ```

4. **Configure Windows Firewall:**
   - Open port 3000 for inbound connections
   - Allow access from tester IP ranges

5. **Access from tester machines:**
   - URL: http://<server-ip>:3000
   - Example: http://10.0.1.50:3000

#### **Linux Server Setup:**

1. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and setup:**
   ```bash
   git clone <repo-url>
   cd Automation-PW
   npm install
   ```

3. **Run as a service:**
   ```bash
   # Install PM2
   sudo npm install -g pm2

   # Start server
   pm2 start tools/codegen-ui/server.ts --name codegen-ui --interpreter ts-node

   # Auto-start on reboot
   pm2 startup
   pm2 save
   ```

4. **Configure firewall:**
   ```bash
   sudo ufw allow 3000/tcp
   ```

---

### Option 3: Docker Container (Advanced)

**Best for:** Cloud deployment, scalability

Create a Docker container for easy deployment.

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx", "ts-node", "tools/codegen-ui/server.ts"]
```

**Run:**
```bash
docker build -t codegen-ui .
docker run -d -p 3000:3000 --name codegen-ui codegen-ui
```

---

## Security Considerations

### For Shared Server Deployment:

1. **Network Access Control:**
   - Restrict access to internal network only
   - Use VPN if accessing remotely
   - Configure firewall rules

2. **Authentication (Optional):**
   - Add basic auth if needed
   - Use reverse proxy (nginx) with authentication

3. **HTTPS (Recommended):**
   - Use nginx as reverse proxy with SSL
   - Get free SSL cert from Let's Encrypt

**Example nginx config:**
```nginx
server {
    listen 80;
    server_name codegen.yourcompany.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Monitoring & Maintenance

### Check Server Status:
```bash
# Using PM2
pm2 status
pm2 logs codegen-ui

# Check if port is listening
netstat -an | findstr 3000  # Windows
netstat -tuln | grep 3000   # Linux
```

### Restart Server:
```bash
pm2 restart codegen-ui
```

### Update Code:
```bash
git pull origin main
npm install
pm2 restart codegen-ui
```

---

## Troubleshooting

### Server won't start:
- Check if port 3000 is already in use
- Verify Node.js is installed: `node --version`
- Check logs: `pm2 logs codegen-ui`

### Testers can't access:
- Verify firewall allows port 3000
- Check server IP is correct
- Ensure server is running: `pm2 status`

### Playwright not working:
- Install browsers on server: `npx playwright install chromium`
- May need to install system dependencies on Linux

---

## Recommended Setup for Your Team

**For 5-10 testers:**
- Use **Option 2** (Shared Server)
- Deploy on a Windows VM in your network
- Use PM2 for auto-restart
- Access via: http://test-automation-server:3000

**For 1-3 testers:**
- Use **Option 1** (Local)
- Each tester runs on their machine
- Simpler, no server maintenance

---

## Alternative: Use Excel Converter Instead

**Note:** Most manual testers find the Excel Converter easier than the Codegen UI because:
- ✅ No server needed
- ✅ No browser recording
- ✅ Familiar Excel interface
- ✅ Easy to review and edit

Consider recommending the Excel method as the primary tool, with Codegen UI as an optional alternative.

---

## Support

For deployment help, contact the automation team or DevOps.
