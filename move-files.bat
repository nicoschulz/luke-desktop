@echo off
echo Moving files from luke-desktop to parent directory...

xcopy /E /H /Y "luke-desktop\*" "."
if errorlevel 1 (
    echo Error moving files!
    pause
    exit /b 1
)

echo Cleaning up temporary directory...
rmdir /S /Q "luke-desktop"

echo Done! Files have been moved successfully.
pause