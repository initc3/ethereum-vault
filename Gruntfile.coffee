module.exports = (grunt) ->

  grunt.option 'stack', true
  grunt.loadTasks "tasks"
  grunt.loadTasks "node_modules/embark-framework/grunt-embark/tasks"
  grunt.loadTasks "node_modules/grunt-ng-annotate/tasks"

  grunt.initConfig(
    files:
      jquery:
        "node_modules/jquery/dist/jquery.js"

      angular:
        src: [
          "node_modules/angular/angular.js"
          "node_modules/angular-route/angular-route.js"
        ]

      materialize:
        "node_modules/materialize-css/dist/js/materialize.js"

      web3:
        "node_modules/embark-framework/js/web3.js"

      js:
        src: [
          "app/js/**/*.js"
        ]

      css:
        src: [
          "node_modules/materialize-css/dist/css/materialize.css"
          "app/css/**/*.css"
        ]

      html:
        src: [
          "app/html/**/*.html"
        ]

      coffee:
        dest: "generated/dapp/compiled-coffee"
        compiled: [
          "generated/dapp/compiled-coffee/app.coffee"
          "generated/dapp/compiled-coffee/**/*.js"
        ]

      contracts:
        src: [
          "app/contracts/**/*.sol"
          "app/contracts/**/*.se"
        ]

    coffee:
      compile:
        expand: true
        cwd: 'coffee'
        src: '**/*.coffee'
        dest: '<%= files.coffee.dest %>'
        ext: '.js'

    concat:
      app:
        src: ["<%= files.jquery %>","<%= files.materialize %>", "<%= files.web3 %>", 'generated/tmp/abi.js', 'generated/dapp/js/app.js', "<%= files.coffee.compiled %>"]
        dest: "generated/dapp/js/app.min.js"

      css:
        src: "<%= files.css.src %>"
        dest: "generated/dapp/css/app.min.css"

    ngAnnotate:
      app:
        src: ["<%= files.angular.src %>", "<%= files.js.src %>"]
        dest: "generated/dapp/js/app.js"

    watch:
      options:
        livereload: true

      html:
        files: ["<%= files.html.src %>"]
        tasks: ["copy"]

      js:
        files: ["<%= files.js.src %>"]
        tasks: ["concat"]

      css:
        files: ["<%= files.css.src %>"]
        tasks: ["concat"]

      coffee:
        files: ["coffee/**/*.coffee"]
        tasks: ["coffee", "concat"]

      contracts:
        files: ["<%= files.contracts.src %>"]
        tasks: ["deploy", "concat", "copy"]

      config:
        files: ["config/blockchain.yml", "config/contracts.yml"]
        tasks: ["deploy", "concat", "copy"]

    copy:
      fontsGenerated:
        expand: true
        cwd: "node_modules/materialize-css/fonts/roboto/"
        src: "**"
        dest: "generated/dapp/fonts/roboto"
        flatten: true
        filter: "isFile"

      fontsDist:
        expand: true
        cwd: "node_modules/materialize-css/fonts/roboto/"
        src: "**"
        dest: "dist/dapp/fonts/roboto"
        flatten: true
        filter: "isFile"

      js:
        "generated/dapp/js/app.min.js" : "<%= concat.app.dest %>"

      html:
        files:
          "generated/dapp/index.html" : "<%= files.html.src %>"
          "dist/dapp/index.html"      : "<%= files.html.src %>"
      css:
        files:
          "dist/dapp/css/app.min.css" : "generated/dapp/css/app.min.css"
      contracts:
        files:
          "dist/contracts/": '<%= files.contracts.src %>'

    uglify:
      dist:
        src: "<%= concat.app.dest %>" # input from the concat process
        dest: "dist/dapp/js/app.min.js"

    clean:
      workspaces: ["dist", "generated"]

    deploy:
      contracts: '<%= files.contracts.src %>'
      dest: 'generated/tmp/abi.js'
  )

  # loading external tasks (aka: plugins)
  # Loads all plugins that match "grunt-", in this case all of our current plugins
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks)

  env = grunt.option('env')

  grunt.registerTask "deploy", ["coffee", "deploy_contracts:"+env, "ngAnnotate", "concat", "copy", "server", "watch"]
  grunt.registerTask "build", ["clean", "deploy_contracts:"+env, "coffee", "ngAnnotate", "concat", "uglify", "copy"]

