var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    debug = false;

gulp.task('lint', function () {
  gulp.src('src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('js', function() {
  var jsTask = gulp.src('src/**/*.js')
    .pipe(concat('ng-context-menu.js'))
    .pipe(gulp.dest('dist'));
  if (!debug) {
    jsTask.pipe(uglify());
  }
  jsTask
    .pipe(rename('ng-context-menu.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('connect', function() {
  gulp.watch(['public/**/*', 'index.html'], function() {
    gulp.src(['public/**/*', 'index.html'])
      .pipe(connect.reload());
  });

  connect.server({
    livereload: true
  });
});

gulp.task('debug', function() {
  debug = true;
});

function changeNotification(event) {
  console.log('File', event.path, 'was', event.type, ', running tasks...');
}

function build() {
  var jsWatcher = gulp.watch('src/**/*.js', ['js', 'lint']);

  jsWatcher.on('change', changeNotification);
}

gulp.task('default', ['js', 'lint'], build);

gulp.task('server', ['connect', 'default']);