const express = require('express');
const compression = require('compression');
const readYaml = require('read-yaml');

module.exports = function(grunt){

  grunt.registerTask("server", "static file development server",function(){
    var serverConfig = readYaml.sync("config/server.yml")

    var webPort = serverConfig.port || 8000;
    var webHost = serverConfig.host || 'localhost';
    var webRoot = "generated/dapp";

    var app = express();
    app.use(compression());
    app.use(express.static("" + (process.cwd()) + "/" + webRoot));
    app.listen(webPort, webHost);

    grunt.log.writeln("Running web server on port http://"+webHost+":"+webPort);

    return app;
  });
}