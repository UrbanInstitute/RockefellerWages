module.exports = function(grunt) {

  // load grunt-* modules from package.json
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    concat: {
      css: {
        src: ['app/css/*.css'],
        dest: 'app/bundle.css',
      },
    },

    // vendor client deps
    bower_concat: {
      all: {
        dest: 'app/bower.js',
        cssDest: 'app/bower.css',
        dependencies: {
          'bootstrap': 'jquery',
          'topojson' : 'd3',
          'select2-bootstrap-css' : 'select2',
          'select2' : 'jquery'
        },
        bowerOptions: {
          relative: false
        }
      }
    },

    watch: {
      html: {
        files: ['./app/index.html']
      },
      scripts : {
        "files" : [
          './app/js/*.js'
        ],
        "tasks" : ['browserify']
      },
      css: {
        files: ["./app/css/*.css"],
        tasks: ["concat:css"]
      },
      options: {
        livereload: true
      }
    },

    browserify : {
      dist : {
        files : {
          'app/bundle.js' : ['app/js/main.js'],
        }
      }
    },

    browserSync: {
      bsFiles: {
        src: [
          './app/css/*',
          './app/index.html',
          './app/js/*'
        ]
      },
      options: {
        notify: false,
        watchTask: true,
        server: {
          baseDir: "./app/",
          index: "index.html"
        }
      }
    }

  });

  var prep = [
    'bower_concat',
    'browserify',
    'concat:css'
  ];

  var watch = [
    'browserSync',
    'watch'
  ];

  var deploy = [
  ];

  grunt.registerTask('default', prep.concat(watch));
  grunt.registerTask('build', prep);
  grunt.registerTask('deploy', prep.concat(deploy));

};