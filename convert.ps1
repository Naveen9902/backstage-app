[Reflection.Assembly]::LoadWithPartialName("System.Drawing")
$imgPath = "C:\Users\pagad\.gemini\antigravity-ide\brain\ca4e82a9-07be-4c59-a045-266bcc540623\media__1784742091385.jpg"
$img = [System.Drawing.Image]::FromFile($imgPath)
$img.Save("d:\back stage\assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
