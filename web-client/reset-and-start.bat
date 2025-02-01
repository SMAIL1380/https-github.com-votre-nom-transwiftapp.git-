@echo off
echo ===== Nettoyage de l'installation precedente =====
echo.

echo 1. Arret des processus Node.js en cours...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 2. Suppression du dossier node_modules...
if exist node_modules (
    rd /s /q node_modules
)

echo 3. Suppression du fichier package-lock.json...
if exist package-lock.json (
    del /f /q package-lock.json
)

echo 4. Nettoyage du cache npm...
call npm cache clean --force

echo 5. Installation des dependances...
call npm install

echo.
echo ===== Installation terminee =====
echo.

echo 6. Demarrage du serveur de developpement...
echo Pour arreter le serveur, appuyez sur Ctrl+C
echo.
call npm run dev

pause
