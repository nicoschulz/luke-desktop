@echo off
echo Checking Node.js installation...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed!
) else (
    echo Node.js is installed
)

echo.
echo Checking Rust installation...
rustc --version
if %ERRORLEVEL% NEQ 0 (
    echo Rust is not installed!
) else (
    echo Rust is installed
)

echo.
echo Checking Cargo installation...
cargo --version
if %ERRORLEVEL% NEQ 0 (
    echo Cargo is not installed!
) else (
    echo Cargo is installed
)

pause