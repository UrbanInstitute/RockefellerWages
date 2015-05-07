module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var deploy_paths;

  // cd to scripts directory and run shell script
  function runScript(script, params) {
    return 'cd app/scripts && sh ' + script + ' ' + (params || '') + ' && cd ../../';
  }

  if (/^win/.test(process.platform)) {
    deploy_path = 'B:/bsouthga/rfdata/';
  } else {
    deploy_path = '/Volumes/Features/bsouthga/rfdata/';
  }


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
        command : runScript('deploy.sh', deploy_path)
      },
      deployData : {
        command : runScript('deploy_data.sh', deploy_path)
      },
      compressData : {
        command : runScript('compress_data.sh')
      },
      getData : {
        command : runScript('get_data.sh')
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
  grunt.registerTask('deploy-data', [
    'shell:deployData'
  ]);
  grunt.registerTask('update-data', [
    'shell:getData',
    'shell:compressData'
  ]);

};