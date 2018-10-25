# osubeatmapdl
A simple lib for node to download osu beatmaps.
```js
const OSUBeatmapDL = require('osubeatmapdl');
var osu = new OSUBeatmapDL.Account("username", "password");

//Download FREEDOM DiVE and Tear Rain
osu.DownloadBeatmaps(["39804", "140662"]);
```
