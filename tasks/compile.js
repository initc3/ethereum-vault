const fs = require('fs');
const path = require('path');
const solc = require('solc');

module.exports = function(grunt){

  function mkdirs(p){
    var components = path.dirname(p).split(path.sep);
    for(var i = 0; i < components.length; i++){
      var d = components.slice(0,i+1).join(path.sep);    
      try{
        var stats = fs.statSync(d);
      }catch(e){
        fs.mkdir(d);
      }      
    }
  }

  grunt.registerTask("compile",'"Compiles" Solidity contracts for integregation with web3', function(dir){

    var abiJs = path.join('generated','tmp','abi.js');
    mkdirs(abiJs);

    fs.writeFileSync(abiJs,"");

    var files = fs.readdirSync(dir);
    var src = {};
    for(var i = 0; i < files.length; i++){
      var absPath = path.join(dir,files[i]);
      src[files[i]] = fs.readFileSync(absPath,{ encoding: 'utf-8' });
    } 
    try{
      var output = solc.compile({ sources: src },1);
      for(var contractName in output.contracts){
        var c = output.contracts[contractName];
        var data = "var " + contractName + "Abi = JSON.parse(" + JSON.stringify(c.interface) + ");\n";
        fs.appendFileSync(abiJs,data);
        data = "var " + contractName + "Code = '" + c.bytecode + "';\n";
        fs.appendFileSync(abiJs,data);
      }
    }catch(e){
      grunt.fail.fatal("Unable to compile " + files,e);
    }
  });

};