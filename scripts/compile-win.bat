windres "src\bin\WinKeyServer\version.rc" -O coff -o "src\bin\WinKeyServer\version.res"
c++ "src\bin\WinKeyServer\main.cpp" "src\bin\WinKeyServer\version.res" -o "bin\WinKeyServer.exe" -static
