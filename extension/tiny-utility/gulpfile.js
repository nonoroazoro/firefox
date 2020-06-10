const del = require("del");
const gulp = require("gulp");
const zip = require("gulp-zip");
const taskListing = require("gulp-task-listing");

const manifest = require("./src/manifest.json");
const xpi = `${manifest.applications.gecko.id}.xpi`;

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
        .pipe(zip(xpi))
        .pipe(gulp.dest("dist"));
});

gulp.task("default", gulp.series("clean", "build"));
