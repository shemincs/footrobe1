const sharp = require('sharp')
const fs = require('fs')



// module.exports = {
//     productCrop: (req, res, next) => {
//         const files = req.files

//         const processFiles = (file, index) => {
//             const inputFilePath = file.inputFilePath

//             sharp(inputFilePath)
//                 .resize(1600, 900)
//                 .toFormat('webp')
//                 .toBuffer((err, processedImageBuffer) => {
//                     if (err) {
//                         req.session.bannerCropErr = `Error processing image ${index + 1}`
//                     } else {
//                         fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
//                             if (writeErr) {
//                                 req.session.bannerCropErr = `Error writing image ${index + 1}`
//                             } else {
//                                 console.log(`Image ${index + 1}cropped and saved successfully to:`, inputFilePath)
//                             }
//                             if (index === files.length - 1) {
//                                 next()
//                             }
//                         })
//                     }
//                 })
//         }

//         files.forEach((file, index) => {
//             processFiles(file, index);
//         });
//     }
// }



// module.exports = {
//     productCrop: (req, res, next) => {
//         const files = req.files;

//         const processFiles = (file, index) => {
//             const inputFilePath = file.path; // Use 'path' instead of 'inputFilePath'

//             const outputFilePath = `${inputFilePath.split('.').slice(0, -1).join('.')}_cropped.webp`;

//             sharp(inputFilePath)
//                 .resize(1600, 900)
//                 .toFormat('webp')
//                 .toFile(outputFilePath, (err, info) => {
//                     if (err) {
//                         req.session.bannerCropErr = `Error processing image ${index + 1}`;
//                     } else {
//                         console.log(`Image ${index + 1} cropped and saved successfully to:`, outputFilePath);
//                     }

//                     if (index === files.length - 1) {
//                         next();
//                     }
//                 });
//         };

//         files.forEach((file, index) => {
//             processFiles(file, index);
//         });
//     }
// }

module.exports = {
    productCrop: (req, res, next) => {
        const files = req.files;

        const processFiles = (file, index) => {
            const inputFilePath = file.path;
            const outputFilePath = `${inputFilePath.split('.').slice(0, -1).join('.')}_cropped.webp`;

            sharp(inputFilePath)
                .resize(800, 800, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .toFormat('webp')
                .toFile(outputFilePath, (err, info) => {
                    if (err) {
                        req.session.bannerCropErr = `Error processing image ${index + 1}`;
                    } else {
                        console.log(`Image ${index + 1} cropped and saved successfully to:`, outputFilePath);
                    }

                    if (index === files.length - 1) {
                        next();
                    }
                });
        };

        files.forEach((file, index) => {
            processFiles(file, index);
        });
    }
};
