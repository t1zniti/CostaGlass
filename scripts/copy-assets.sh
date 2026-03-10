#!/bin/zsh
set -e
cd "$(dirname "$0")/.."

cp "public/Assets/products/bioclimatic/p1.jpg" src/assets/products/pergola/p1.jpg
cp "public/Assets/products/bioclimatic/p2.jpg" src/assets/products/pergola/p2.jpg
cp "public/Assets/products/bioclimatic/p3.jpg" src/assets/products/pergola/p3.jpg
cp "public/Assets/products/bioclimatic/p4.jpg" src/assets/products/pergola/p4.jpg
cp "public/Assets/products/bioclimatic/download.webp" src/assets/products/pergola/download.webp

cp "public/Assets/products/Guillotine-Style Glass Windows/c1.jpg" src/assets/products/guillotina/c1.jpg
cp "public/Assets/products/Guillotine-Style Glass Windows/download.webp" src/assets/products/guillotina/download.webp
cp "public/Assets/products/Guillotine-Style Glass Windows/download-1.webp" src/assets/products/guillotina/download-1.webp
cp "public/Assets/products/Guillotine-Style Glass Windows/download-2.webp" src/assets/products/guillotina/download-2.webp
cp "public/Assets/products/Guillotine-Style Glass Windows/download-3.webp" src/assets/products/guillotina/download-3.webp

cp "public/Assets/products/zip screen/l1.jpg" src/assets/products/toldo-zip/l1.jpg
cp "public/Assets/products/zip screen/download.webp" src/assets/products/toldo-zip/download.webp
cp "public/Assets/products/zip screen/download-1.webp" src/assets/products/toldo-zip/download-1.webp
cp "public/Assets/products/zip screen/download-2.webp" src/assets/products/toldo-zip/download-2.webp
cp "public/Assets/products/zip screen/Uso-Comercial-1030x718.webp" src/assets/products/toldo-zip/uso-comercial.webp
cp "public/Assets/products/zip screen/Uso-Residencial.webp" src/assets/products/toldo-zip/uso-residencial.webp

cp "public/Assets/products/Retractable PVC Roof/g1.jpg" src/assets/products/retractable/g1.jpg
cp "public/Assets/products/Retractable PVC Roof/download.webp" src/assets/products/retractable/download.webp
cp "public/Assets/products/Retractable PVC Roof/download-1.webp" src/assets/products/retractable/download-1.webp
cp "public/Assets/products/Retractable PVC Roof/download-2.webp" src/assets/products/retractable/download-2.webp
cp "public/Assets/products/Retractable PVC Roof/download-3.webp" src/assets/products/retractable/download-3.webp
cp "public/Assets/products/Retractable PVC Roof/Screenshot_2-1030x717.webp" src/assets/products/retractable/screenshot.webp

cp "public/Assets/products/paraviento de criustal/a1.jpg" src/assets/products/paraviento/a1.jpg
cp "public/Assets/products/paraviento de criustal/paravientos-terraza-cristal.jpg" src/assets/products/paraviento/terraza.jpg
cp "public/Assets/products/paraviento de criustal/paravientos-restaurante-cortavientos.webp" src/assets/products/paraviento/restaurante.webp
cp "public/Assets/products/paraviento de criustal/paraviento_flk_slide-945x420-1.webp" src/assets/products/paraviento/slide.webp
cp "public/Assets/products/paraviento de criustal/paravientos_0000_OCT21_FLKe.webp" src/assets/products/paraviento/oct21.webp

echo "All images copied successfully"
