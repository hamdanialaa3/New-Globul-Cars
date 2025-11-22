@echo off
REM Create symlinks for packages in node_modules
REM This allows webpack to import from packages/ directory

echo Creating symlinks for @globul-cars packages...

cd bulgarian-car-marketplace\node_modules

REM Create symlink for @globul-cars
if not exist "@globul-cars" (
    mklink /D "@globul-cars" "..\..\packages"
    echo Created symlink: @globul-cars -> ..\..\packages
) else (
    echo Symlink @globul-cars already exists
)

echo.
echo Symlinks created successfully!
echo You may need to restart the dev server.

pause

