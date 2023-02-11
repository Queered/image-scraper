const cheerio = require('cheerio');
const fs = require('fs');

const config = require('./cfg')

const crypto = require('crypto');
const path = require('path');

const filePath =  config.input
const outputDir = config.output

fs.readFile(filePath, 'utf8', function (err, html) {
  if (err) {
    console.error(err);
    return;
  }

  const $ = cheerio.load(html);
  const mediaUrls = [];
  $('img, video').each(function () {
    let src = $(this).attr('src');
    if (!src) {
      src = $(this).attr('poster');
    }
    if (src && src.startsWith('https://cdn.discordapp') && (src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.gif') || src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.ogg')) && !src.includes('emojis') && !src.includes('stickers')) {
      mediaUrls.push(src);
    }
  });

  const folderName = crypto.randomBytes(6).toString('hex');
  const folderPath = path.join(outputDir, folderName);
  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    const urlFile = path.join(folderPath, 'urls.txt');
    fs.writeFile(urlFile, mediaUrls.join('\n'), function (err) {
      if (err) {
        console.error(err);
        return;
      }
    });

    for (let i = 0; i < mediaUrls.length; i++) {
      const url = mediaUrls[i];
      const ext = path.extname(url);
      const fileName = i + ext;
      const filePath = path.join(folderPath, fileName);
      const request = require('request');
      request(url)
        .on('error', function (err) {
          console.error(err);
        })
        .pipe(fs.createWriteStream(filePath));
    }
  });
});
