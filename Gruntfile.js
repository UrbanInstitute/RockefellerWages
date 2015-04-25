module.exports = function(grunt) {

  // load grunt-* modules from package.json
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    uglify: {
      main: {
        files: {
          'dist/bundle.js': ['app/bundle.js'],
          'dist/bower.js': ['app/bower.js']
        }
      }
    },

    cssmin: {
      main: {
        files: {
          'dist/bower.css': ['app/bower.css'],
          'dist/bundle.css': ['app/bundle.css']
        }
      }
    },

    shell: {
      makeDist: {
        command: 'mkdir -p dist'
      },
      rmDist : {
        command : 'rm -rf dist'
      }
    },

    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    },

    concat: {
      css: {
        src: ['app/css/*.css'],
        dest: 'app/bundle.css',
      },
    },

    copy : {
      main: {
        files: [
          {src: 'app/index.html', dest: 'dist/index.html'}
        ]
      }
    },


    // vendor client deps
    bower_concat: {
      all: {
        dest: 'app/bower.js',
        cssDest: 'app/bower.css',
        dependencies: {
          'jquery-ui' : 'jquery',
          'bootstrap': 'jquery',
          'angular': 'jquery',
          'angular-route' : 'angular',
          'angular-ui-select' : 'angular',
          'angular-sanitize' : 'angular',
          'angular-ui-slider' : ['jquery', 'jquery-ui', 'angular'],
          'topojson' : 'd3'
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

  var deploy = prep.concat([
    'shell:makeDist',
    'uglify',
    'cssmin',
    'copy',
    'gh-pages',
    'shell:rmDist'
  ]);

  grunt.registerTask('default', prep.concat(watch));
  grunt.registerTask('build', prep);
  grunt.registerTask('deploy', deploy);

};