module.exports = function(grunt){

  // set default contracts directory to app/contracts
  grunt.option('contracts','./app/contracts');

  // initialize grunt
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    files:{
      jquery: "node_modules/jquery/dist/jquery.js",
      angular:{
        src: [
          "node_modules/angular/angular.js",
          "node_modules/angular-route/angular-route.js"
        ]
      },  
      materialize: "node_modules/materialize-css/dist/js/materialize.js",
      web3: "node_modules/web3/dist/web3.js",
      js:{
        src: [
          "app/js/**/*.js"
        ]
      },
      css:{
        src: [
          "node_modules/materialize-css/dist/css/materialize.css",
          "app/css/**/*.css"
        ]
      },
      html:{
        src: [
          "app/html/**/*.html"
        ]
      },
      contracts:{
        src: [
          "app/contracts/**/*.sol",
          "app/contracts/**/*.se"
        ]
      }
    },
    ngAnnotate:{
      app:{
        src: [
          "<%= files.angular.src %>", 
          "<%= files.js.src %>"
        ],
        dest: "generated/dapp/js/app.annotated.js"
      }
    },
    concat:{
      app:{
        src: [
          "<%= files.jquery %>",
          "<%= files.materialize %>",         
          'generated/tmp/abi.js', 
          "<%= files.angular.src %>",
          "<%= files.js.src %>"
        ],
        dest: "generated/dapp/js/app.min.js",
      },
      appMin:{
        src: [
          "<%= files.jquery %>",
          "<%= files.materialize %>",        
         'generated/tmp/abi.js', 
          '<%= ngAnnotate.app.dest %>'
        ],
        dest: "generated/dapp/js/app.annotated.js"
      },
      css:{
        src: "<%= files.css.src %>",
        dest: "generated/dapp/css/app.min.css"
      }
    },
    watch:{
      options:{
        livereload: true
      },
      html:{
        files: ["<%= files.html.src %>"],
        tasks: ["concat","copy"]
      },
      js:{
        files: ["<%= files.js.src %>"],
        tasks: ["concat","copy"]
      },
      css:{
        files: ["<%= files.css.src %>"],
        tasks: ["concat","copy"]
      },
      contracts:{
        files: ["<%= files.contracts.src %>"],
        tasks: ["deploy", "concat", "copy"]
      },
      config:{
        files: ["config/blockchain.yml", "config/contracts.yml"],
        tasks: ["deploy", "concat", "copy"]
      }
    },
    copy:{
      fontsGenerated:{
        expand: true,
        cwd: "node_modules/materialize-css/fonts/roboto/",
        src: "**",
        dest: "generated/dapp/fonts/roboto",
        flatten: true,
        filter: "isFile"
      },
      fontsDist:{
        expand: true,
        cwd: "node_modules/materialize-css/fonts/roboto/",
        src: "**",
        dest: "dist/dapp/fonts/roboto",
        flatten: true,
        filter: "isFile"
      },
      html:{
        files:{
          "generated/dapp/index.html" : "<%= files.html.src %>",
          "dist/dapp/index.html"      : "<%= files.html.src %>"
        }
      },
      css:{
        files:{
          "dist/dapp/css/app.min.css" : "generated/dapp/css/app.min.css"
        }
      },
      contracts:{
        files:{
          "dist/contracts/": '<%= files.contracts.src %>'
        }
      }
    },
    uglify:{
      dist:{
        src: "<%= concat.appMin.dest %>",
        dest: "dist/dapp/js/app.min.js"
      }
    },
    clean:{
      workspaces: ["dist", "generated"]
    },
    deploy:{
      contracts: '<%= files.contracts.src %>',
      dest: 'generated/tmp/abi.js'
    }
  });

  // loading external tasks (aka: plugins)
  // Loads all plugins that match "grunt-", in this case all of our current plugins
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  var env = grunt.option('env');
  var contractsDir = grunt.option('contracts');

  grunt.loadTasks("tasks");
  grunt.loadTasks("node_modules/grunt-ng-annotate/tasks");

  grunt.registerTask("dev", ["compile:"+contractsDir,"concat", "copy", "server", "watch"]);
  
  grunt.registerTask("build", ["clean", "compile:"+contractsDir, "ngAnnotate", "concat", "uglify", "copy"]);

}