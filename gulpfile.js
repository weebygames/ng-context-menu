var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    protractor = require("gulp-protractor").protractor,
    debug = false,
    WATCH_MODE = 'watch',
    RUN_MODE = 'run';

var mode = RUN_MODE;

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
  if (mode === WATCH_MODE) {
    gulp.watch(['index.html'], function() {
      gulp.src(['index.html'])
        .pipe(connect.reload());
    });
  }

  connect.server({
    livereload: mode === WATCH_MODE
  });
});

gulp.task('protractor', function(done) {
  gulp.src(["./src/tests/*.js"])
    .pipe(protractor({
      configFile: 'protractor.conf.js',
      args: ['--baseUrl', 'http://127.0.0.1:8080']
    }))
    .on('end', function() {
      if (mode === RUN_MODE) {
        connect.serverClose();
      }
      done();
    })
    .on('error', function() { done(); });
});

gulp.task('debug', function() {
  debug = true;
});

gulp.task('watch-mode', function() {
  mode = WATCH_MODE;
});

function watch() {
  var jsWatcher = gulp.watch('src/**/*.js', ['js', 'lint']);

  function changeNotification(event) {
    console.log('File', event.path, 'was', event.type, ', running tasks...');
  }

  jsWatcher.on('change', changeNotification);
}

// Removing protractor from default task until phantomjs issue is fixed
//gulp.task('default', ['watch-mode', 'js', 'lint', 'protractor'], watch);
gulp.task('default', ['watch-mode', 'js', 'lint'], watch);
gulp.task('server', ['connect', 'default']);
gulp.task('test', ['connect', 'protractor']);