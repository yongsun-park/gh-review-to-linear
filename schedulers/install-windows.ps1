#Requires -Version 5.1
param(
    [int]$IntervalMinutes = 30
)

$ErrorActionPreference = "Stop"

$TaskName = "gh-review-to-linear"
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$NodePath = (Get-Command node -ErrorAction Stop).Source
$IndexPath = Join-Path $ProjectDir "index.js"

# Remove existing task if present
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed existing task."
}

$Action = New-ScheduledTaskAction `
    -Execute $NodePath `
    -Argument "`"$IndexPath`"" `
    -WorkingDirectory $ProjectDir

$Trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) `
    -RepetitionDuration (New-TimeSpan -Days 9999)

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "Sync GitHub PR review requests to Linear issues" `
    -RunLevel Limited

Write-Host ""
Write-Host "Installed scheduled task: $TaskName"
Write-Host "  Interval: ${IntervalMinutes} minutes"
Write-Host ""
Write-Host "To uninstall:"
Write-Host "  Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
