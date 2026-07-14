<#
 Generate PWA icons with GDI+ (no external tools).
 Output: icons/icon-512.png, icons/icon-192.png, icons/icon-maskable-512.png, icons/apple-touch-icon.png
 Usage: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-icons.ps1
 NOTE: keep this file ASCII-only (PS 5.1 misreads UTF-8 without BOM).
#>
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'icons'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# Label text: "JUN 2" using U+6E96 (jun) + "2", built from code points to stay ASCII-safe
$label = [string][char]0x6E96 + '2'

function New-StarPoints([float]$cx, [float]$cy, [float]$rOut, [float]$rIn) {
    $pts = New-Object 'System.Collections.Generic.List[System.Drawing.PointF]'
    for ($i = 0; $i -lt 10; $i++) {
        $ang = -90 + $i * 36
        $r = if ($i % 2 -eq 0) { $rOut } else { $rIn }
        $rad = [Math]::PI * $ang / 180
        $pts.Add((New-Object System.Drawing.PointF(($cx + $r * [Math]::Cos($rad)), ($cy + $r * [Math]::Sin($rad)))))
    }
    return $pts.ToArray()
}

function New-Icon([int]$size, [float]$contentScale, [string]$path) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background: blue -> purple gradient (matches app theme)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $c1 = [System.Drawing.ColorTranslator]::FromHtml('#4fb8ff')
    $c2 = [System.Drawing.ColorTranslator]::FromHtml('#a98cff')
    $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
    $g.FillRectangle($bg, $rect)

    $s = $size * $contentScale   # content area (smaller for maskable safe zone)
    $cx = $size / 2.0

    # Gold star with soft shadow
    $starCy = $size * 0.5 - $s * 0.27
    $gold = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#ffd43b'))
    $shadowBr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 40, 30, 90))
    $ptsSh = New-StarPoints ($cx + $s * 0.012) ($starCy + $s * 0.012) ($s * 0.155) ($s * 0.062)
    $g.FillPolygon($shadowBr, $ptsSh)
    $pts = New-StarPoints $cx $starCy ($s * 0.155) ($s * 0.062)
    $g.FillPolygon($gold, $pts)

    # Label text
    $fontFamily = 'Yu Gothic UI'
    try {
        $font = New-Object System.Drawing.Font($fontFamily, [float]($s * 0.30), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    } catch {
        $font = New-Object System.Drawing.Font('Meiryo', [float]($s * 0.30), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    }
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textY = $size * 0.5 + $s * 0.13
    $textRectSh = New-Object System.Drawing.RectangleF([float]($s * 0.012), [float]($textY - $s * 0.25 + $s * 0.012), [float]$size, [float]($s * 0.5))
    $g.DrawString($label, $font, $shadowBr, $textRectSh, $fmt)
    $textRect = New-Object System.Drawing.RectangleF([float]0, [float]($textY - $s * 0.25), [float]$size, [float]($s * 0.5))
    $g.DrawString($label, $font, [System.Drawing.Brushes]::White, $textRect, $fmt)

    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output ("generated: " + $path)
}

function Resize-Icon([string]$srcPath, [int]$size, [string]$destPath) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $size, $size)
    $g.Dispose(); $src.Dispose()
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output ("generated: " + $destPath)
}

$icon512 = Join-Path $outDir 'icon-512.png'
New-Icon 512 1.0 $icon512
New-Icon 512 0.72 (Join-Path $outDir 'icon-maskable-512.png')   # maskable: keep content in center safe zone
Resize-Icon $icon512 192 (Join-Path $outDir 'icon-192.png')
Resize-Icon $icon512 180 (Join-Path $outDir 'apple-touch-icon.png')
Write-Output 'done'
