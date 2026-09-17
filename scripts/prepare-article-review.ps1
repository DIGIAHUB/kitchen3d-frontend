$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$source = Join-Path (Split-Path -Parent $repo) 'recovery\wordpress-posts-0059db1dde59'
$manifest = Get-Content -LiteralPath (Join-Path $source 'manifest.json') -Raw | ConvertFrom-Json
$output = Join-Path $source 'text-review-v2'
if (Test-Path -LiteralPath $output) { throw 'Refusing to overwrite existing review artifacts' }
$drafts = foreach ($entry in $manifest.articles) {
  $file = Join-Path $source ($entry.slug + '.json')
  if ((Get-FileHash -LiteralPath $file).Hash.ToLowerInvariant() -cne $entry.sha256) { throw 'Recovery hash mismatch' }
  $article = Get-Content -LiteralPath $file -Raw | ConvertFrom-Json
  # Text extraction, NOT an HTML sanitizer. Output is inert JSON, never raw HTML.
  $html = [regex]::Replace($article.bodyHtml, '(?is)<(script|style|svg|iframe|object)\b[^>]*>.*?</\1\s*>', '')
  $blocks = @(
    foreach ($match in [regex]::Matches($html, '(?is)<(p|h[1-6]|li)\b[^>]*>(.*?)</\1\s*>')) {
      $text = [System.Net.WebUtility]::HtmlDecode([regex]::Replace($match.Groups[2].Value, '<[^>]*>', ' '))
      $text = [regex]::Replace($text, '\s+', ' ').Trim()
      if ($text) {
        $type = if ($match.Groups[1].Value -eq 'p') { 'paragraph' } elseif ($match.Groups[1].Value -eq 'li') { 'list-item' } else { 'heading' }
        [ordered]@{ type=$type; text=$text }
      }
    }
  )
  # This export includes an embedded sidebar before the first article paragraph.
  if ($entry.slug -eq 'expert-kitchen-fitting-installation-services') {
    $start = -1
    for ($i=0; $i -lt $blocks.Count; $i++) { if ($blocks[$i].text.StartsWith('A kitchen serves more than one purpose')) { $start=$i; break } }
    if ($start -lt 0) { throw 'Expert article boundary not found' }
    $blocks = @($blocks[$start..($blocks.Count-1)])
  }
  if ($blocks.Count -eq 0) { throw 'No recovered text blocks' }
  # Explicit owner instruction: remove unconfirmed standalone design/3D offer.
  $removed = @($blocks | Where-Object { $_.text -match '(?i)design[- ]only|3D visual' })
  $blocks = @($blocks | Where-Object { $_.text -notmatch '(?i)design[- ]only|3D visual' })
  [ordered]@{ slug=$entry.slug; sourceSha256=$entry.sha256; publicationAllowed=$false; launchHold=($entry.slug -eq 'thinking-about-wardrobe-installation-in-manchester'); removedUnconfirmedOfferBlocks=$removed.Count; body=[ordered]@{ version=1; reviewState='pending'; blocks=$blocks }; reviewFlags=@($blocks | Where-Object { $_.text -match '(?i)guarantee|certif|qualified|regulation|planning permission|return on investment|increase.*value|on time|within budget|no hidden|2 to 6|structural' } | ForEach-Object { $_.text }) }
}
New-Item -ItemType Directory -Path $output | Out-Null
foreach ($draft in $drafts) { $draft | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $output ($draft.slug + '.json')) -Encoding utf8NoBOM }
Write-Output "TEXT_REVIEW_READY: $($drafts.Count) inert drafts; all pending; $output"
