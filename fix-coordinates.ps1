$desaFiles = Get-ChildItem "d:\JIMPITAN 2026\GITHUB\DUKOPS\CO_*.txt"

foreach ($file in $desaFiles) {
    $desaName = $file.BaseName -replace "^CO_", ""
    
    # Read all lines
    $lines = Get-Content $file.FullName
    
    # Parse coordinates
    $coordinates = @()
    foreach ($line in $lines) {
        if ($line -match '^\s*(-?\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(.+?)\s*$') {
            $lat = [double]$matches[1]
            $lon = [double]$matches[2]
            $elevation = $matches[3].Trim()
            
            $coordinates += @{
                lat       = $lat
                lon       = $lon
                elevation = $elevation
            }
        }
    }
    
    # Build JSON object
    $jsonObject = @{
        desa        = $desaName
        coordinates = $coordinates
    }
    
    # Convert to JSON
    $json = ConvertTo-Json $jsonObject -Compress
    
    # Write to file
    $outputPath = "d:\JIMPITAN 2026\GITHUB\DUKOPS\data\coordinates\$desaName.json"
    Set-Content $outputPath $json
    
    Write-Host "Created: $desaName.json ($($coordinates.Count) entries)"
}

Write-Host "All coordinate files converted successfully!"
