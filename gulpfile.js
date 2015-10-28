var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var cssmin = require('gulp-minify-css');
var annotate = require('gulp-ng-annotate');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var paths = {
  css: './public/assets/**/*.css',
  js: './public/app/**/*.js'
};

gulp.task('style', function() {
  return gulp.src(paths.css).
  pipe(concat('styles')).
  pipe(cssmin()).
  pipe(rename({
    suffix: '.min.css'
  })).
  pipe(gulp.dest('./public/assets/css'));
});

gulp.task('lint', function() {
  gulp.src('public/app/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('script', function() {
  return gulp.src(paths.js).
  pipe(concat('main')).
  pipe(annotate()).
  pipe(uglify()).
  pipe(rename({
    suffix: '.min.js'
  })).
  pipe(gulp.dest('./public/minified'));
});

gulp.task('nodemon', ['script'], function() {
  nodemon({
      script: 'server.js',
      ext: 'js'
    })
    .on('restart', function() {
      console.log('server restarted!')
    });
});

gulp.task('default', ['lint', 'style', 'script', 'nodemon']);
