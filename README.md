# osubeatmapdl
<a href="https://www.npmjs.com/package/osubeatmapdl"><img src="https://nodei.co/npm/osubeatmapdl.png" alt="npm package"></a>

## About
Simple node.js module for downloading osu beatmaps.

## Installation
**Node.js 4.0.0 or newer is required.**
<br>`npm install osubeatmapdl`

## Example:
```js
const OSUBeatmapDL = require('osubeatmapdl');
var osu = new OSUBeatmapDL.Account("username", "password");

//Download FREEDOM DiVE and Tear Rain
osu.DownloadBeatmaps(["39804", "140662"]);
```
