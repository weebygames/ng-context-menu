var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    protractor = require("gulp-protractor").protractor,
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
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('connect', function() {
  gulp.watch(['index.html'], function() {
    gulp.src(['index.html'])
      .pipe(connect.reload());
  });

  connect.server({
    livereload: true
  });
});

gulp.task('protractor', function(done) {
  gulp.src(["./src/tests/*.js"])
    .pipe(protractor({
      configFile: 'protractor.conf.js',
      args: ['--baseUrl', 'http://127.0.0.1:8080']
    }))
    .on('end', function() { done(); })
    .on('error', function() { done(); });
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

gulp.task('default', ['js', 'lint', 'protractor'], build);

gulp.task('server', ['connect', 'default']);