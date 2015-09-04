module.exports = function(grunt) {

  // Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			css: {
				files: ['scss/*.scss', 'src/*.js'],
				tasks: ['uglify','sass']
			}
		},
		sass: {
			options: {
				sassDir: 'scss',
				cssDir: 'www/css',
				noLineComments: true,
				outputStyle:'compressed',
				spawn: false
			},
			app: {
				files: {
					'www/css/app.css': 'scss/app.scss'
				}
			}
		},
		uglify: {
			my_target: {
				files: {
					'www/js/AXNavigation.js': ['src/*.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-sass');

	grunt.registerTask('sass-run', ['sass:app', 'uglify','watch:css']);
};