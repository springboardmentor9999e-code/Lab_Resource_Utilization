@echo off
echo Starting Lab Resource Platform Backend...
echo.
set PATH=C:\Users\harshith_kumar\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin;%PATH%
echo Make sure PostgreSQL is running with:
echo   Database: lab_resource_platform
echo   User:     postgres
echo   Password: postgres
echo   Port:     5432
echo.
cd /d "%~dp0backend"
mvn spring-boot:run
pause
