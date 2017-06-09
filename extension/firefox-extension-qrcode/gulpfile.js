const del = require("del");
const gulp = require("gulp");
const zip = require("gulp-zip");
const taskListing = require("gulp-task-listing");

gulp.task("help", taskListing.withFilters(null, "default|clean"));

// Clean.
gulp.task("clean", () =>
{
    return del("dist/*");
});

// Packaging (to .xpi file).
gulp.task("build", () =>
{
    return gulp.src("src/**/*")
        .pipe(zip("tinyqrcode@nonoroazoro.com.xpi"))
        .pipe(gulp.dest("dist"));
});

gulp.task("default", ["clean", "build"], () =>
{
});
