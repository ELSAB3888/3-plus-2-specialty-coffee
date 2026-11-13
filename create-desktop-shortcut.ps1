# Creates a desktop shortcut for the 3+2 Admin System
$projectDir = $PSScriptRoot
$batFile = Join-Path $projectDir "start-admin.bat"
$shortcutPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), '3+2 Admin.lnk')

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $batFile
$shortcut.WorkingDirectory = $projectDir
$shortcut.WindowStyle = 1
$shortcut.Description = "3+2 Specialty Coffee Admin Dashboard"
$shortcut.IconLocation = "shell32.dll,13"
$shortcut.Save()

Write-Host "Desktop shortcut created: $shortcutPath" -ForegroundColor Green
