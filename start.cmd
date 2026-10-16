@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:5032 in your browser.
python -m http.server 5032 --directory dist
