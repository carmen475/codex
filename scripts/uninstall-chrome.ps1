[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$LogFile = (Join-Path $env:WINDIR "Temp\Chrome-Uninstall.log"),
    [switch]$RemoveUserData
)

$ErrorActionPreference = "Stop"
$WorkspaceId = "LX8F-43TH"

function Write-Log {
    param([Parameter(Mandatory = $true)][string]$Message)

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - [$WorkspaceId] $Message" | Out-File -Append -FilePath $LogFile -Encoding utf8
}

function Test-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Invoke-ChromeUninstall {
    param(
        [Parameter(Mandatory = $true)][System.IO.FileInfo]$Setup,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$Scope
    )

    if (-not $PSCmdlet.ShouldProcess($Setup.FullName, "Uninstall Chrome ($Scope)")) {
        return $true
    }

    Write-Log "Running $Scope uninstaller: $($Setup.FullName)"
    $process = Start-Process -FilePath $Setup.FullName -ArgumentList $Arguments -Wait -PassThru -NoNewWindow
    if ($process.ExitCode -ne 0) {
        Write-Log "$Scope uninstaller returned exit code $($process.ExitCode)."
        return $false
    }

    Write-Log "$Scope uninstaller completed successfully."
    return $true
}

if (-not (Test-Administrator)) {
    Write-Error "Run this script from an elevated PowerShell session."
    exit 1
}

$logDirectory = Split-Path -Parent $LogFile
if (-not (Test-Path -LiteralPath $logDirectory)) {
    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
}

$failed = $false
Write-Log "Starting Chrome uninstall."

Get-Process -Name chrome -ErrorAction SilentlyContinue | ForEach-Object {
    if ($PSCmdlet.ShouldProcess("Chrome process $($_.Id)", "Stop")) {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

$machineRoots = @($env:ProgramFiles, ${env:ProgramFiles(x86)}) |
    Where-Object { $_ } |
    ForEach-Object { Join-Path $_ "Google\Chrome\Application" }
$installRoots = @($machineRoots)

foreach ($root in $machineRoots) {
    if (-not (Test-Path -LiteralPath $root)) {
        continue
    }

    $setup = Get-ChildItem -LiteralPath $root -Recurse -Filter setup.exe -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if ($setup) {
        $arguments = @("--uninstall", "--multi-install", "--chrome", "--system-level", "--force-uninstall")
        if (-not (Invoke-ChromeUninstall -Setup $setup -Arguments $arguments -Scope "machine-wide")) {
            $failed = $true
        }
    }
}

Get-ChildItem -LiteralPath (Join-Path $env:SystemDrive "Users") -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $user = $_
    $applicationRoot = Join-Path $user.FullName "AppData\Local\Google\Chrome\Application"
    if (Test-Path -LiteralPath $applicationRoot) {
        $script:installRoots += $applicationRoot
        $setup = Get-ChildItem -LiteralPath $applicationRoot -Recurse -Filter setup.exe -File -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
        if ($setup) {
            $arguments = @("--uninstall", "--chrome", "--force-uninstall")
            if (-not (Invoke-ChromeUninstall -Setup $setup -Arguments $arguments -Scope "user $($user.Name)")) {
                $script:failed = $true
            }
        }
    }

    if ($RemoveUserData) {
        $userData = Join-Path $user.FullName "AppData\Local\Google\Chrome\User Data"
        if ((Test-Path -LiteralPath $userData) -and $PSCmdlet.ShouldProcess($userData, "Remove Chrome user data")) {
            Remove-Item -LiteralPath $userData -Recurse -Force -ErrorAction SilentlyContinue
            Write-Log "Removed Chrome user data for $($user.Name)."
        }
    }
}

$remaining = $installRoots | Where-Object { Test-Path -LiteralPath (Join-Path $_ "chrome.exe") }
if ($remaining) {
    Write-Log "Chrome executable remains under: $($remaining -join ', ')"
    $failed = $true
}

if ($failed) {
    Write-Log "Chrome uninstall completed with errors."
    exit 1
}

Write-Log "Chrome uninstall completed."
exit 0
