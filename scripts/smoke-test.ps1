# SIGETRAD - Smoke Test del Backend
# Uso: con el servidor corriendo (npm run server), ejecutar:
#   powershell -ExecutionPolicy Bypass -File scripts\smoke-test.ps1

$baseUrl = "http://localhost:4000"
$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param([string]$Name, [string]$Method, [string]$Path, [hashtable]$Body = $null)
    try {
        $uri = "$baseUrl$Path"
        if ($Body) {
            $json = $Body | ConvertTo-Json -Depth 5
            $resp = Invoke-RestMethod -Uri $uri -Method $Method -ContentType "application/json" -Body $json
        } else {
            $resp = Invoke-RestMethod -Uri $uri -Method $Method
        }
        Write-Host "[OK]   $Name -> $Method $Path" -ForegroundColor Green
        return $resp
    } catch {
        Write-Host "[FAIL] $Name -> $Method $Path :: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "=== SIGETRAD Backend Smoke Test ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl`n"

# 1. Health check
Test-Endpoint -Name "Health" -Method GET -Path "/api/health"

# 2. Login (credenciales por defecto del seed)
$loginBody = @{ username = "admin"; password = "admin" }
$login = Test-Endpoint -Name "Login" -Method POST -Path "/api/auth/login" -Body $loginBody

# 3. Listados principales
Test-Endpoint -Name "Clientes" -Method GET -Path "/api/clientes"
Test-Endpoint -Name "Pilotos" -Method GET -Path "/api/pilotos"
Test-Endpoint -Name "Gondolas" -Method GET -Path "/api/gondolas"
Test-Endpoint -Name "Viajes" -Method GET -Path "/api/viajes"
Test-Endpoint -Name "Facturas" -Method GET -Path "/api/facturas"
Test-Endpoint -Name "Pagos" -Method GET -Path "/api/pagos"
Test-Endpoint -Name "Combustible" -Method GET -Path "/api/combustible"
Test-Endpoint -Name "Usuarios" -Method GET -Path "/api/usuarios"

Write-Host "`n=== Fin del smoke test ===" -ForegroundColor Cyan
