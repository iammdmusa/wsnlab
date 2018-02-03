"use strict";

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps')
    //del = require('del');
  

// gulp.task("concatScript", function(){
//     return gulp.src([
//         'public/js/jquery.js',
//         'public/js/sticky/jquery.sticky.js',
//         "public/js/main.js"
//     ])
//     .pipe(maps.init())
//     .pipe(concat("/public/js/app.js"))
//     .pipe(maps.write('./'))
//     .pipe(gulp.dest("js"));
// });

gulp.task("compailSass", function(){
    return gulp.src("public/scss/application.scss")
        .pipe(maps.init())
        .pipe(sass())
        .pipe(maps.write('./'))
        .pipe(gulp.dest("./public/css/")
    );
});

// gulp.task("minifyScript", function(){
//     return gulp.src("js/app.js")
//         .pipe(uglify())
//         .pipe(rename('app.min.js'))
//         .pipe(gulp.dest('js')
//     );
// });

gulp.task("watch", function(){
    gulp.watch(['/public/scss/**/*.scss'],['compailSass']);
    //gulp.watch('js/main.js', ['concatScript']);
});

// gulp.task('clean', function(){
//     del(['dist', 'css/application.css*', 'js/app*.js*']);
// });

// gulp.task("build", ['concatScript', 'minifyScript', 'compailSass'], function(){
//     gulp.src(['css/application.css', 'js/app.min.js', 'index.html', 'img/**', 'fonts/**'],{base : './'})
//     .pipe(gulp.dest('dist'));
// });

// gulp.task('serve', ['watch']);

// gulp.task('default', ['clean'], function(){
//     gulp.start('build');
// });