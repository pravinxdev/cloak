@echo off

call cls


cd /d D:\projects\npm\cloak

echo Building project...
call npm run build

echo Linking CLI...
call npm link

echo Running CloakX...
cloakx web

pause