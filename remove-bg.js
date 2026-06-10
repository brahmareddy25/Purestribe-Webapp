const Jimp = require('jimp');

async function removeBackground() {
  const imagePath = 'public/purescribe_logo_v6.png';
  console.log('Loading image...');
  const image = await Jimp.read(imagePath);
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const red = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];
    
    // To cleanly remove the black background from a neon glowing image,
    // we use the max RGB value as the alpha channel. This perfectly preserves glowing edges
    // and antialiasing without ugly black halos.
    const alpha = Math.max(red, green, blue);
    
    // If we want the neon color to stay saturated even when semi-transparent,
    // we can boost the RGB slightly, but keeping it as-is works great.
    this.bitmap.data[idx + 3] = alpha;
  });
  
  console.log('Saving transparent image...');
  await image.writeAsync('public/purescribe_logo_v6_transparent.png');
  console.log('Done!');
}

removeBackground().catch(console.error);
