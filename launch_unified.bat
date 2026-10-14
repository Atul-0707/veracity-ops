@echo off
title Veracity Data Intelligence Platform - Unified Engine & Portal
echo =======================================================================
echo   STARTING VERACITY DATA INTELLIGENCE PLATFORM (UNIFIED SINGLE ENGINE)
echo =======================================================================
echo.
echo [1/2] Starting Python Core Engine Backend (Port 8000)...
start "Veracity Python Engine Core (Port 8000)" cmd /k "cd /d C:\Users\Nagendra tiwari\.gemini\antigravity\scratch\data_intelligence_engine && python launch_portal.py"

echo [2/2] Starting React Web Portal Frontend (Port 5173)...
cd /d "C:\Users\Nagendra tiwari\OneDrive\Desktop\project"
start "Veracity Web Portal (Port 5173)" cmd /k "npm run dev"

echo.
echo =======================================================================
echo   Both systems are now running and fully synchronized:
echo   - Python Engine API: http://127.0.0.1:8000/api/v1/engine/status
echo   - Web Portal UI:     http://localhost:5173/demo
echo   - Master Admin:      http://127.0.0.1:8000/admin
echo =======================================================================
