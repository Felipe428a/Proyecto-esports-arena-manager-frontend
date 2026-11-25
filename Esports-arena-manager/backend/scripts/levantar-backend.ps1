# Levanta el backend completo en Windows (una ventana de PowerShell por servicio).
# Requisitos: Java 21 y PostgreSQL en localhost:5432 con la base esports_arena
#   (la forma más simple: Docker Desktop →  docker compose up -d postgres  desde la carpeta backend).
# Uso (desde la carpeta backend):   powershell -ExecutionPolicy Bypass -File .\scripts\levantar-backend.ps1
# Opcional: -SinEureka  (no levanta Eureka; el Gateway usa las URLs directas de cada servicio)
param([switch]$SinEureka)

$raiz = Split-Path -Parent $PSScriptRoot
$servicios = @(
  'user-service', 'game-service', 'auth-service', 'tournament-service', 'team-service',
  'sanction-service', 'registration-service', 'match-service', 'result-service',
  'ranking-service', 'prize-service', 'notification-service', 'api-gateway'
)

$variables = ''
if ($SinEureka) {
  $variables = "`$env:EUREKA_ENABLED='false'; " +
    "`$env:AUTH_SERVICE_URL='http://localhost:8080'; `$env:USER_SERVICE_URL='http://localhost:8081'; " +
    "`$env:TEAM_SERVICE_URL='http://localhost:8082'; `$env:TOURNAMENT_SERVICE_URL='http://localhost:8083'; " +
    "`$env:REGISTRATION_SERVICE_URL='http://localhost:8084'; `$env:SANCTION_SERVICE_URL='http://localhost:8085'; " +
    "`$env:MATCH_SERVICE_URL='http://localhost:8086'; `$env:GAME_SERVICE_URL='http://localhost:8087'; " +
    "`$env:RESULT_SERVICE_URL='http://localhost:8088'; `$env:RANKING_SERVICE_URL='http://localhost:8089'; " +
    "`$env:PRIZE_SERVICE_URL='http://localhost:8090'; `$env:NOTIFICATION_SERVICE_URL='http://localhost:8091'; "
} else {
  $servicios = @('discovery-server') + $servicios
}

# El wrapper de Maven necesita .mvn\wrapper\maven-wrapper.properties; si falta, se crea
$wrapper = Join-Path $raiz '.mvn\wrapper\maven-wrapper.properties'
if (-not (Test-Path $wrapper)) {
  New-Item -ItemType Directory -Force -Path (Split-Path $wrapper) | Out-Null
  Copy-Item (Join-Path $PSScriptRoot 'maven-wrapper.properties') $wrapper
  Write-Host "Creado .mvn\wrapper\maven-wrapper.properties" -ForegroundColor Yellow
}

Write-Host "Compilando todos los módulos (primera vez puede tardar)..." -ForegroundColor Cyan
Push-Location $raiz
& .\mvnw.cmd -q -DskipTests install
Pop-Location

foreach ($s in $servicios) {
  $comando = "$variables`$host.UI.RawUI.WindowTitle='$s'; Set-Location '$raiz'; .\mvnw.cmd -q -pl $s spring-boot:run '-Dspring-boot.run.jvmArguments=-Xmx256m'"
  Start-Process powershell -ArgumentList '-NoExit', '-Command', $comando
  Write-Host "→ $s" -ForegroundColor Green
  if ($s -eq 'discovery-server') { Start-Sleep -Seconds 15 } else { Start-Sleep -Seconds 6 }
}

Write-Host ""
Write-Host "Listo. En 1 a 2 minutos estarán arriba:" -ForegroundColor Cyan
Write-Host "  API Gateway:      http://localhost:8070/api/v1"
Write-Host "  Swagger unificado: http://localhost:8070/swagger-ui.html"
if (-not $SinEureka) { Write-Host "  Eureka:           http://localhost:8761" }
