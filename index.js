const request = require('request');
const fs = require('fs');

class OsuBeatmapDownloader {
  constructor(user, pass) {
    this.cookieJar = request.jar();
    this.startTime = new Date();

    //Setting by default
    this.delay = 0;
    this.preferNoVid = false;
    this.folder = 'beatmaps';

    //Auth
    this.user = user || 'username';
    this.pass = pass || 'password';

    request.post({
      url: 'https://osu.ppy.sh/forum/ucp.php?mode=login',
      jar: this.cookieJar,
      formData: {
        username: this.user,
        password: this.pass,
        login: 'login'
      }
    }, (err, res, body) => {
      if (err) throw err;
      var check = body.match(/You have specified an incorrect username/i);

      if (check) {
        throw new Error('You have specified an incorrect username!');
      } else {
        this.logged = true;
        console.log('Logged as', this.user);
      }
    });
  }

  get uptime() {
    return new Date() - this.startTime + 'ms';
  }

  Defaults(opt = {}) {
    //Delay
    this.delay = opt.delay || this.delay;
    if (typeof this.delay != 'number') throw new Error('Incorrect delay type! Use number...');

    //Prefer no video
    this.preferNoVid = opt.preferNoVid || this.preferNoVid;
    if (typeof this.preferNoVid != 'boolean') throw new Error('Incorrect preferNoVid type! Use boolean...');

    //Folder
    this.folder = opt.folder || this.folder;
  }

  DownloadBeatmaps(ids, opt = {}) {
    var currentBeatmap = 0; //current beatmap number
    var fileregexp = /[^0-9A-Za-z!@#$%^&()_+=[\]'. -]/g //File regexp
    //Tip: delete wrong symbols to fix fs.createWriteStream() windows error

    //Delay
    opt.delay = opt.delay || this.delay;
    if (typeof opt.delay != 'number') throw new Error('Incorrect delay type! Use number...');

    //Prefer no video
    opt.preferNoVid = opt.preferNoVid || this.preferNoVid;
    if (typeof opt.preferNoVid != 'boolean') throw new Error('Incorrect preferNoVid type! Use boolean...');

    //Folder
    opt.folder = opt.folder || this.folder;

    if (opt.preferNoVid == true) opt.preferNoVid = 'n'
    else if (opt.preferNoVid == false) opt.preferNoVid = '';

    fs.mkdir(opt.folder, (err) => {
      if (err && err.code != 'EEXIST') throw err;
    });

    function Download(gthis) {
      if (!gthis.logged) return setTimeout(() => { Download(gthis) }, 500);

      var download = request.get({
        url: 'https://osu.ppy.sh/d/' + ids[currentBeatmap] + opt.preferNoVid,
        jar: gthis.cookieJar,
        timeout: 10000
      });

      download.on('error', (err) => {
        if (err) {
          if (err.code == 'ETIMEDOUT') {
            console.log('Timeout! trying again...')
            return setTimeout(() => { Download(gthis) }, 500);
          } else {
            throw err;
          }
        }
      })

      download.on('response', (res) => {
        if (res.headers['content-type'] == 'application/download') {
          let filename = res.headers['content-disposition'].split('filename=')[1].split('"')[1]; //Get beatmap file name
          let filesize = res.headers['content-length'];
          //let loadedsize = 0;
          //let percent = 0;

          console.log('Start downloading', filename + '...');

          download.on('data', (chunk) => {
            //loadedsize += chunk.length;
            //percent = ((loadedsize / filesize) * 100).toFixed(0);
            //somethink this
          });

          download.on('end', () => {
            currentBeatmap++;
            console.log('Beatmap loaded!');
            if (currentBeatmap < ids.length) return setTimeout(() => { Download(gthis) }, opt.delay);
          });

          download.pipe(fs.createWriteStream(opt.folder + '/' + filename.replace(fileregexp, '')));
        } else {
          currentBeatmap++;
          console.log('This beatmap doesn\'t exist!');
          if (currentBeatmap < ids.length) return setTimeout(() => { Download(gthis) }, opt.delay);
        }
      })
    }

    Download(this);
  }
}

module.exports = {
  Account: OsuBeatmapDownloader
};
