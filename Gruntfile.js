module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    uglify: {
      main: {
        options : {
          screwIE8 : true
        },
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
      deploy : {
        command : 'cd app/scripts && sh deploy.sh && cd ../../'
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
          {src: 'app/index.html', dest: 'dist/index.html'},
          {expand: true, cwd: 'app/images/', src: ['**'], dest: 'dist/images/'},
        ]
      }
    },


    // vendor client deps
    bower_concat: {
      all: {
        dest: 'app/bower.js',
        cssDest: 'app/bower.css',
        include : [
          'jquery',
          'jquery-ui',
          'bootstrap',
          'font-awesome',
          'angular',
          'angular-route',
          'angular-ui-select',
          'angular-sanitize',
          'angular-ui-slider',
          'd3',
          'topojson'
        ],
        mainFiles: {
          'jquery-ui': ['ui/jquery-ui.js', 'themes/smoothness/jquery-ui.css']
        },
        dependencies : {
          'angular-ui-slider' : 'jquery-ui'
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
          './app/js/*.js',
          './app/js/**/*.js'
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
          'app/bundle.js' : ['app/js/app.js'],
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

  var watch = prep.concat([
    'browserSync',
    'watch'
  ]);

  var build = prep.concat([
    'uglify',
    'cssmin',
    'copy'
  ]);

  var deploy = build.concat([
    'shell:deploy'
  ]);


  grunt.registerTask('default', watch);
  grunt.registerTask('build', build);
  grunt.registerTask('deploy', deploy);

};