'use strict';
// ==================================================================================
// all.js
// ----------------------------------------------------------------------------------
// Description:   node dmidecode test script
//                for Node.js
// Copyright:     (c) 2017 - 2018
// Author:        Christopher Harrison
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
//
var dmi = require('../lib/dmidecode');

dmi.all(function (data){
  console.log(JSON.stringify(data, true, 4));
});
