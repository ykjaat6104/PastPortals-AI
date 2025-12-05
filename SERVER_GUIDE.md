# PastPortals - Server Management

## 🚀 Easy Start (Recommended)

### Option 1: Persistent Background Server
```
Double-click: START_APP.bat
```
- Starts server in background
- **Safe to close terminal**
- Server keeps running
- Access at: http://localhost:3000

### Option 2: Quick PowerShell Start
```
Right-click START_APP.ps1 → Run with PowerShell
```

## 🛑 Stop Server
```
Double-click: STOP_APP.bat
```

## 📊 Check Status
```
Double-click: CHECK_STATUS.bat
```

## 🔄 Restart Server
```
Double-click: RESTART_APP.bat
```

## 📝 Manual Control

### Start (Terminal stays open)
```bash
cd frontend
npm start
```

### Start (Background - PowerShell)
```powershell
cd frontend
Start-Process -NoNewWindow npm -ArgumentList "start"
```

### Stop All Servers
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Check if Running
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue
```

## 🎯 Recommended Workflow

1. **Start**: Run `START_APP.bat`
2. **Use**: Open http://localhost:3000
3. **Close Terminal**: Window can be closed, server keeps running
4. **Stop**: Run `STOP_APP.bat` when done

## ⚡ Pro Tips

- Server runs in background after using START_APP.bat
- You can close PowerShell/CMD windows safely
- Server survives terminal closes
- Use STOP_APP.bat to cleanly shutdown
- CHECK_STATUS.bat to verify server state

## 🔧 Troubleshooting

**Server won't start?**
```bash
cd frontend
npm install
npm start
```

**Port 3000 in use?**
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>
```

**Clean restart?**
```bash
STOP_APP.bat
# Wait 5 seconds
START_APP.bat
```
