Add-Type -AssemblyName System.Drawing

function Export-SquareCrop {
  param(
    [string]$Source,
    [string]$Destination,
    [System.Drawing.Rectangle]$Crop
  )

  $sourceImage = [System.Drawing.Bitmap]::new((Resolve-Path $Source).Path)
  try {
    $output = [System.Drawing.Bitmap]::new(1024, 1024)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($output)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($sourceImage, [System.Drawing.Rectangle]::new(0, 0, 1024, 1024), $Crop, [System.Drawing.GraphicsUnit]::Pixel)
      } finally {
        $graphics.Dispose()
      }
      $output.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $output.Dispose()
    }
  } finally {
    $sourceImage.Dispose()
  }
}

$machineNames = @(
  'billets', 'furnace', 'piercer', 'mill',
  'reducer', 'coolbed', 'straightener', 'inspection',
  'cutting', 'threading', 'coupling', 'warehouse-rack'
)

for ($index = 0; $index -lt $machineNames.Count; $index++) {
  $column = $index % 4
  $row = [Math]::Floor($index / 4)
  $crop = [System.Drawing.Rectangle]::new($column * 384 + 21, $row * 341, 341, 341)
  Export-SquareCrop -Source 'src/assets/img/sheets/equipment-sheet.png' -Destination "src/assets/img/machines/$($machineNames[$index]).png" -Crop $crop
}

for ($index = 0; $index -lt 6; $index++) {
  $cellWidth = [Math]::Floor(1823 / 6)
  $crop = [System.Drawing.Rectangle]::new($index * $cellWidth, 270, $cellWidth, $cellWidth)
  Export-SquareCrop -Source 'src/assets/img/sheets/forming-sheet.png' -Destination "src/assets/img/forming/stage-$($index + 1).png" -Crop $crop
}
