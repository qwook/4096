
module.exports = function(grunt) {

  // All upfront config goes in a massive nested object.
  grunt.initConfig({
    watch: {
        js: {
            files: ['src/**/*.js'],
            tasks: ['browserify']
        },
        less: {
            files: ['style/**/*.less'],
            tasks: ['less']
        }
    },
    browserify: {
      dist: {
        files: {
          'build/module.js': ['src/index.js']
        },
        options: {
          debug: true
        }
      }
    },
    less: {
      dist: {
        files: {
          'build/stylesheet.css': 'style/stylesheet.less'
        },
        options: {
          paths: ['style/', './']
        }
      }
    }
  }); // The end of grunt.initConfig

  // We've set up each task's configuration.
  // Now actually load the tasks.
  // This will do a lookup similar to node's require() function.
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Register our own custom task alias.
  grunt.registerTask('build', ['browserify']);
};