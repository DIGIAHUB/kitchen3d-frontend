param([Parameter(Mandatory=$true)][string]$ExportPath)
$ErrorActionPreference = 'Stop'
$source = Get-Item -LiteralPath $ExportPath
if ($source.Length -gt 25000000) { throw 'Export exceeds local recovery size limit' }
$digest = (Get-FileHash -LiteralPath $source.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
$settings = [System.Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [System.Xml.DtdProcessing]::Prohibit
$settings.XmlResolver = $null
$settings.MaxCharactersInDocument = 25000000
$reader = [System.Xml.XmlReader]::Create($source.FullName, $settings)
$document = [System.Xml.XmlDocument]::new()
$document.XmlResolver = $null
try { $document.Load($reader) } finally { $reader.Close() }
$ns = [System.Xml.XmlNamespaceManager]::new($document.NameTable)
$ns.AddNamespace('wp', 'http://wordpress.org/export/1.2/')
$ns.AddNamespace('content', 'http://purl.org/rss/1.0/modules/content/')
if ($document.rss.channel.link.TrimEnd('/') -cne 'https://kitchen3d.co.uk') { throw 'Wrong source site' }
$repo = Split-Path -Parent $PSScriptRoot
$expected = @(Get-ChildItem -LiteralPath (Join-Path $repo 'posts') -Filter '*.json' | ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json })
$posts = @($document.SelectNodes('//channel/item[wp:post_type="post" and wp:status="publish"]', $ns))
if ($posts.Count -ne 7 -or $expected.Count -ne 7) { throw 'Unexpected article inventory' }
$seen = @{}
$records = foreach ($post in $posts) {
  $slug = $post.SelectSingleNode('wp:post_name', $ns).InnerText
  if ($slug -cnotmatch '^[a-z0-9]+(-[a-z0-9]+)*$' -or $seen.ContainsKey($slug)) { throw 'Invalid or duplicate slug' }
  $seen[$slug] = $true
  $original = @($expected | Where-Object { $_.slug -ceq $slug })
  if ($original.Count -ne 1) { throw 'Source slug does not match saved inventory' }
  $html = $post.SelectSingleNode('content:encoded', $ns).InnerText
  if ([string]::IsNullOrWhiteSpace($html)) { throw 'Missing article body' }
  $link = $post.SelectSingleNode('link').InnerText
  if ($link.TrimEnd('/') -cne "https://kitchen3d.co.uk/$slug") { throw 'Unexpected article URL' }
  [ordered]@{
    status = 'RECOVERED_SOURCE_ONLY_NOT_APPROVED_FOR_PUBLICATION'
    sourceExportSha256 = $digest
    slug = $slug
    wordpressId = [int]$post.SelectSingleNode('wp:post_id', $ns).InnerText
    historicalSavedId = $original[0].id
    title = $post.SelectSingleNode('title').InnerText
    sourceUrl = $link
    bodyHtml = $html
  }
}
# Generated recovery artifacts, never application imports or public assets.
# No comments, author contact data, plugin metadata or attachment records copied.
$output = Join-Path (Split-Path -Parent $repo) ('recovery\wordpress-posts-' + $digest.Substring(0,12))
if (Test-Path -LiteralPath $output) { throw 'Recovery target already exists; refusing overwrite' }
New-Item -ItemType Directory -Path $output | Out-Null
$manifest = foreach ($record in $records) {
  $destination = Join-Path $output ($record.slug + '.json')
  $record | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $destination -Encoding utf8NoBOM
  [ordered]@{ slug=$record.slug; wordpressId=$record.wordpressId; historicalSavedId=$record.historicalSavedId; bodyCharacters=$record.bodyHtml.Length; sha256=(Get-FileHash -LiteralPath $destination).Hash.ToLowerInvariant() }
}
[ordered]@{ sourceExportSha256=$digest; articleCount=$records.Count; excludedItemCount=($document.SelectNodes('//channel/item').Count-$records.Count); publicationAllowed=$false; articles=@($manifest) } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $output 'manifest.json') -Encoding utf8NoBOM
Write-Output "RECOVERY_COMPLETE: $($records.Count) source articles; output=$output; publicationAllowed=false"
