const { src, dest, series } = require("gulp");
const rimraf = require("rimraf");
const zip = require("gulp-zip");

const manifest = require("./src/manifest.json");
const filename = `${manifest.applications.gecko.id}.xpi`;

/**
 * Clean.
 */
function clean(cb)
{
    rimraf("dist/*", cb);
}

/**
 * Packaging (to .xpi file).
 */
function build()
{
    return src("src/**/*")
        .pipe(zip(filename))
        .pipe(dest("dist"));
}

exports.default = series(clean, build);
