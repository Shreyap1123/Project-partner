@echo off
if not defined JAVA_HOME (
    set "JAVA_HOME=C:\Program Files\Java\jdk1.8.0_144"
)
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "DIR=%~dp0"
"%DIR%..\apache-maven-3.8.8\bin\mvn.cmd" %*
