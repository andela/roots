var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var cssmin = require('gulp-minify-css');
var annotate = require('gulp-ng-annotate');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var removeLines = require('gulp-strip-line');


var paths = {
  staticCss: [
    './public/libs/font-awesome/css/font-awesome.css',
    './public/libs/angular-material/angular-material.min.css',
    './public/libs/summernote/dist/summernote.css',
    './public/libs/angularjs-color-picker/angularjs-color-picker.min.css',
    './public/libs/angular-bootstrap-datetimepicker/src/css/datetimepicker.css,',
    './public/assets/css/jquery-ui-css.css',
    './public/assets/css/materialize.css'
  ],
  staticJs: [
    './public/assets/js/jquery.js',
    './public/assets/js/jquery-ui.js',
    './public/libs/angular/angular.js',
    './public/libs/angular-animate/angular-animate.js',
    './public/libs/angular-aria/angular-aria.js',
    './public/libs/moment/moment.js',
    './public/libs/bootstrap/dist/js/bootstrap.js',
    './public/libs/angular-ui-router/release/angular-ui-router.js',
    './public/libs/venturocket-angular-slider/build/angular-slider.js',
    './public/libs/angular-touch/angular-touch.js',
    './public/libs/angular-bootstrap/ui-bootstrap-tpls.min.js',
    './public/libs/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
    './public/libs/ng-file-upload/ng-file-upload-all.js',
    './public/libs/ng-file-upload/ng-file-upload-shim.js',
    './public/libs/ngAutocomplete.js',
    './public/libs/angular-material/angular-material.js',
    './public/libs/angular-messages/angular-messages.js',
    './public/libs/angular-resource/angular-resource.js',
    './public/libs/summernote/dist/summernote.js',
    './public/libs/angular-summernote/dist/angular-summernote.js',
    './public/libs/tinycolor/tinycolor.js',
    './public/libs/angularjs-color-picker/angularjs-color-picker.js',
    './public/libs/ngmap/build/scripts/ng-map.js',
    './public/assets/js/materialize.js'
  ],
  dynamicJs: './public/app/**/*.js',
  dynamicCss: './public/assets/css/stylesheet.css',
  allJs: [
    './public/app/app.module.js',
    './public/app/services/baseurl.service.js',
    './public/app/services/event.service.js',
    './public/app/services/organizer.service.js',
    './public/app/services/user.service.js',
    './public/app/controllers/editevent.controller.js',
    './public/app/controllers/event.controller.js',
    './public/app/controllers/event.view.controller.js',
    './public/app/controllers/home.controller.js',
    './public/app/controllers/moreevents.controller.js',
    './public/app/controllers/profile.controller.js',
    './public/app/controllers/resetpass.controller.js',
    './public/app/controllers/twitter.controller.js',
    './public/app/directives/directives.js'
  ]
};

gulp.task('static-css', function() {
  return gulp.src(paths.staticCss).
  pipe(concat('main')).
  pipe(cssmin({
      keepSpecialComments: 1,
      rebase: false
    })).
  pipe(rename({
    suffix: '.min.css'
  })).
  pipe(gulp.dest('./public/build/css'));
});

gulp.task('remove-lines', function() {
  return gulp.src('./public/index.html').
  pipe(removeLines(['.controller', '.service', '.module', '/assets/css/'])).
  pipe(gulp.dest('./public'));
});

gulp.task('static-js', function() {
  return gulp.src(paths.staticJs).
  pipe(concat('main')).
  pipe(annotate()).
  pipe(uglify()).
  pipe(rename({
    suffix: '.min.js'
  })).
  pipe(gulp.dest('./public/build/js'));
});

gulp.task('dynamic-css', function() {
  return gulp.src(paths.dynamicCss).
  pipe(concat('main-dynamic')).
  pipe(cssmin({
      keepSpecialComments: 1,
      rebase: false
    })).
  pipe(rename({
    suffix: '.min.css'
  })).
  pipe(gulp.dest('./public/build/css'));
});

gulp.task('dynamic-js', function() {
  return gulp.src(paths.dynamicJs).
  pipe(concat('main-dynamic')).
  pipe(annotate()).
  pipe(uglify()).
  pipe(rename({
    suffix: '.min.js'
  })).
  pipe(gulp.dest('./public/build/js'));
});

gulp.task('lint', function() {
  gulp.src(paths.dynamicJs)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('nodemon', ['lint', 'static-js', 'static-css'], function() {
  nodemon({
      script: 'server.js',
      ext: 'js'
    })
    .on('restart', function() {
      console.log('server restarted!')
    });
});

gulp.task('dev', ['lint', 'static-js','static-css', 'nodemon']);

gulp.task('default', ['lint', 'remove-lines', 'static-js', 'dynamic-js', 'static-css', 'dynamic-css', 'nodemon']);