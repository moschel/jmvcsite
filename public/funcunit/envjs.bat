@echo off

SETLOCAL ENABLEDELAYEDEXPANSION

set BASE=%~dps0

if not "%BASE%" == "" ( set BASE=%BASE:\=/% )

:: trim spaces
for /f "tokens=1*" %%A in ("%BASE%") do SET BASE=%%A

SET CP=%BASE%java/selenium-java-client-driver.jar;%BASE%../steal/rhino/js.jar

SET ARGS=[

for /f "tokens=1,2,3,4,5,6 delims= " %%a in ("%*") do SET ARGS=!ARGS!'%%a','%%b','%%c','%%d','%%e','%%f'

for %%a in (",''=") do ( call set ARGS=%%ARGS:%%~a%% )

for /f "tokens=1*" %%A in ("%ARGS%") do SET ARGS=%%A

SET ARGS=%ARGS%,'%BASE%']

set ARGS=%ARGS:\=/%

java -Xss1024k -cp %CP% org.mozilla.javascript.tools.shell.Main -opt -1 -e _args=%ARGS% -e load('%BASE%scripts/run.js')
