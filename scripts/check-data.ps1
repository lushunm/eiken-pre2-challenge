<#
 data/*.js の整合性チェック
 - append-only 検査: HEAD と比較し、既存エントリの削除・途中挿入・変更を検出
 - リテラル ID の重複検査
 使い方: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-data.ps1 [-SkipDiff] [-Ref HEAD]
 終了コード: 0 = PASS / 2 = 違反あり（hook 経由の場合は Claude に通知される）
#>
param(
    [string]$Ref = 'HEAD',
    [switch]$SkipDiff
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$entryPattern = '^\s*[\[{]'
$problems = @()

# --- 1) append-only 検査（Ref 時点で git 管理下にある data/*.js が対象） ---
if (-not $SkipDiff) {
    $tracked = @(git ls-tree -r --name-only $Ref -- data/)
    foreach ($f in (Get-ChildItem (Join-Path $root 'data\*.js'))) {
        $rel = 'data/' + $f.Name
        if ($tracked -notcontains $rel) { continue }  # 新規ファイルは対象外
        $oldRaw = git show "${Ref}:$rel"
        if ($LASTEXITCODE -ne 0) { continue }
        $old = @($oldRaw | Where-Object { $_ -match $entryPattern })
        $new = @((Get-Content $f.FullName -Encoding UTF8) | Where-Object { $_ -match $entryPattern })
        if ($new.Count -lt $old.Count) {
            $problems += "[削除] $rel : エントリ数が $($old.Count) から $($new.Count) に減少。既存項目の削除は禁止（後続の ID がずれる）"
            continue
        }
        $mismatch = -1
        for ($i = 0; $i -lt $old.Count; $i++) {
            if ($new[$i] -cne $old[$i]) { $mismatch = $i; break }
        }
        if ($mismatch -ge 0) {
            if ($new.Count -eq $old.Count) {
                $problems += "[変更] $rel : 既存エントリ（$($mismatch + 1) 番目）が変更されている。誤り修正（内容のみ・ID/位置/件数の維持）なら OK — 意図した修正かを確認すること"
            } else {
                $problems += "[途中挿入?] $rel : 既存エントリ $($mismatch + 1) 番目以降がずれている。追加は必ず配列の末尾に行うこと"
            }
        }
    }
}

# --- 2) リテラル ID の重複検査 ---
$ids = @{}
foreach ($f in (Get-ChildItem (Join-Path $root 'data\*.js'))) {
    $content = Get-Content $f.FullName -Encoding UTF8 -Raw
    foreach ($m in [regex]::Matches($content, '[\s{,]id\s*:\s*["'']([^"'']+)["'']')) {
        $id = $m.Groups[1].Value
        if ($ids.ContainsKey($id)) {
            $problems += "[ID重複] '$id' が $($ids[$id]) と $($f.Name) の両方に存在"
        } else {
            $ids[$id] = $f.Name
        }
    }
}

# --- 結果 ---
if ($problems.Count -gt 0) {
    $problems | ForEach-Object { [Console]::Error.WriteLine($_) }
    [Console]::Error.WriteLine("check-data: NG（$($problems.Count) 件）。data/*.js は末尾追加のみ・ID 固定が原則。")
    exit 2
}
Write-Output "check-data: PASS（リテラル ID: $($ids.Count) 件、重複なし）"
exit 0
