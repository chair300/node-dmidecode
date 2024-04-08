'use strict';
// ==================================================================================
// dmidecode.js
// ----------------------------------------------------------------------------------
// Description:   node dmidecode - library
//                for Node.js
// Copyright:     (c) 2017 - 2018
// Author:        Christopher Harrison
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
//


const exec = require('child_process').exec;
//const util = require('util')

//module.run = function(){


var all = function(callback) {
  exec('export LC_ALL=C; dmidecode ; unset LC_ALL', function(error, stdout) {
    if (!error) {
      return callback(toObject(stdout));
    }
  });
}
exports.all = all;

var type = function(data,callback) {
 exec('export LC_ALL=C; dmidecode -s ; unset LC_ALL',function(error,output){
  output.array.forEach(element => {
    var string = '';
    if (Array.isArray(type)) {
      for (var i = 0; i < type.length; i++) {
        if (type[i] == element){
          string += ' -t ' + element;
        }
      }
    } else {
      if (type == element){
         string = ' -t ' + type;
      }
    }
    exec('export LC_ALL=C; dmidecode ' + string + '; unset LC_ALL', function(error, stdout) {
    if (!error) {
      return callback(toObject(stdout));
    }
  });
}

exports.type = type;

var item = function(data,callback) {
 exec('export LC_ALL=C; dmidecode -s ; unset LC_ALL',function(error,output){
    output.array.forEach(element => {
      if(item == element){
        exec('export LC_ALL=C; dmidecode -s ' + element + '; unset LC_ALL', function(error, stdout) {
          if (!error) {
            return callback(JSON.stringify({
              data: stdout
            }));
          }
        });
      }
    })
  })
  return callback(JSON.stringify({});
}

exports.item = item;

var cpu = function(callback) {
  exec('export LC_ALL=C; dmidecode -t processor -t cache; unset LC_ALL', function(error, stdout) {
    if (!error) {
      return callback(toObject(stdout));
    }
  });
}

exports.cpu = cpu;

var toObject = function(data) {
  var obj = {};
  var header = 1;
  let lines = data.toString().split('\n');
  var handle;
  var secondaryKey;
  var objArray={};
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].match(/Table at/g) && header) {
      header = 0;
      i = i + 2; // move to the next available line for injust
    }
    if (header) {
      continue; // we are not at the data yet, skipping
    }
    var tabs = lines[i].split('\t'); // the file is tab delimited based on element, split according
    lines[i].trimmed;
    if (tabs[1] == undefined && tabs[2] == undefined && tabs[0] != undefined) {
      // we are first order, add to root object
      if (lines[i].startsWith('Handle 0x0') || lines[i] == '') {
        continue;
      }
      if (lines[i].startsWith('End Of Table')){
        if(handle==undefined){
          continue; // unlikely
        }
      }
      // Do I have any data to build my object?
        if(Object.keys(objArray).length != 0){
            //console.log(objArray);
            if(obj[handle]==undefined){
              obj[handle]=objArray;
            }else{
              if(Array.isArray(obj[handle])){
                obj[handle].push(objArray);
              }else{
                if(Object.keys(obj[handle]).length != 0){
                 var tmp = obj[handle];
                 obj[handle]=[];
                 obj[handle].push(tmp);
                 obj[handle].push(objArray);
                }else{
                 // unlikely
                 obj[handle]=objArray;
                }
              }
            }
           }

         objArray={};
         handle = lines[i];
    }
    // we must be second or third order if third order we should add to our prior second order
    if (tabs[2] == undefined && tabs[0] == '' && tabs[1] != undefined) {
      tabs[1].trimmed;
      // test for second order
      // we are second order now do something
      let keyval = tabs[1].split(':');
      //console.log('key: '+keyval[0]+'->value: '+keyval[1]);
      if (keyval[0] != '') {
        keyval[0].trimmed;
        //  console.log('here keyval: '+keyval);
        if (keyval[1] == '' || keyval[1]==undefined) {
          // we have an array coming so we need to set a placeholder
          secondaryKey = keyval[0];
        } else {
          keyval[1].trimmed;
          if (isNaN(keyval[1])) { // let's check if our we have a numberic
            objArray[keyval[0]] = keyval[1];
          } else {
            objArray[keyval[0]] = Number(keyval[1]);
          }
        }
      } // we have garbage here, lets' log it just incase
      //console.log('logging garbage'+lines[i]);
    }
    //second order
    if (tabs[0] == '' && tabs[1] == '' && tabs[2] != undefined) {
      // we are in third order here
      //console.log('we get '+handle+' here2: '+secondaryKey+' results in: '+tabs[2]);
      if (objArray[secondaryKey] == undefined) {
          objArray[secondaryKey] = [];
      }
      //obj[handle][secondaryKey]=[];
      objArray[secondaryKey].push(tabs[2]);
    }
  }
  //console.log(JSON.stringify(obj, true, 4));
  return obj;
}
