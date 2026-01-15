const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const fs = require('fs');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');

const scssSourceDir = './tylt/scss/';
const outputFile = './tylt/scss/all.scss';
const outputCssDir = './assets/';

function generateImports(done) {
    console.log('Début de la génération de _all.scss...');
    fs.readdir(scssSourceDir, (err, files) => {
        if (err) {
            console.error('Erreur lors de la lecture du dossier scss :', err);
            done(err);
            return;
        }

        const scssFiles = files.filter(file => file.endsWith('.scss') && file !== path.basename(outputFile));
        const importStatements = scssFiles.map(file => `@import '${file}';`).join('\n');

        fs.writeFile(outputFile, importStatements, (err) => {
            if (err) {
                console.error('Erreur lors de l\'écriture du fichier all.scss :', err);
                done(err);
                return;
            }
            console.log('Fichier _all.scss généré avec succès.');
            done();
        });
    });
}

function buildStyles() {
    console.log('Début de la compilation de style.min.css...');
    return gulp
        .src(outputFile) // Utilisation de _all.scss comme fichier source
        .pipe(sourcemaps.init()) // Initialisation des sourcemaps
        .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(rename('style.css'))
        .pipe(sourcemaps.write('./')) // Écriture des sourcemaps dans le dossier courant
        .pipe(gulp.dest(outputCssDir)) // Destination du fichier compilé
        .on('end', () => console.log('Compilation de style.min.css terminée.'));
}

gulp.task('scss', gulp.series(generateImports, buildStyles));

gulp.task('watch', function () {
    gulp.watch([`${scssSourceDir}/**/*.scss`, `!${outputFile}`], gulp.series('scss'));
});

gulp.task('default', gulp.series('scss', 'watch'));
