const gulp = require('gulp')


gulp.task('copyToSpeedBrowser' , ()=>{
    gulp.src(['./*.*'])
    .pipe(gulp.dest('./../speed_browser/node_modules/isite'))

    gulp.src(['./lib/*.*' ])
    .pipe(gulp.dest('./../speed_browser/node_modules/isite/lib'))

    gulp.src(['./isite_files/*' , './isite_files/*/*.*'])
    .pipe(gulp.dest('./../speed_browser/node_modules/isite/isite_files'))

})

gulp.task('default' , ['copyToSpeedBrowser'])

