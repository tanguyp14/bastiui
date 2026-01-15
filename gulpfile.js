const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const fs = require('fs');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');

const scssSourceDir = './tylt/scss/';
const outputFile = './tylt/scss/all.scss';
const outputCssDir = './assets/';

// Ordre d'import des dossiers (base en premier pour les variables/fonts)
const importOrder = ['base', 'layout', 'components'];

function getAllScssFiles(dir, baseDir = dir) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            results = results.concat(getAllScssFiles(filePath, baseDir));
        } else if (file.endsWith('.scss') && file !== 'all.scss') {
            // Chemin relatif depuis le dossier scss
            const relativePath = path.relative(baseDir, filePath);
            results.push(relativePath);
        }
    }

    return results;
}

function generateImports(done) {
    console.log('Début de la génération de all.scss...');

    try {
        const allFiles = getAllScssFiles(scssSourceDir);

        // Trier les fichiers selon l'ordre des dossiers
        const sortedFiles = allFiles.sort((a, b) => {
            const dirA = path.dirname(a).split(path.sep)[0];
            const dirB = path.dirname(b).split(path.sep)[0];
            const indexA = importOrder.indexOf(dirA);
            const indexB = importOrder.indexOf(dirB);

            // Si le dossier n'est pas dans l'ordre, le mettre à la fin
            const orderA = indexA === -1 ? 999 : indexA;
            const orderB = indexB === -1 ? 999 : indexB;

            if (orderA !== orderB) return orderA - orderB;
            return a.localeCompare(b);
        });

        const importStatements = sortedFiles.map(file => {
            // Enlever l'extension .scss et le underscore pour @use
            const importPath = file.replace(/\.scss$/, '').replace(/\\/g, '/');
            return `@import '${importPath}';`;
        }).join('\n');

        fs.writeFileSync(outputFile, importStatements);
        console.log('Fichier all.scss généré avec succès.');
        console.log('Fichiers importés:', sortedFiles);
        done();
    } catch (err) {
        console.error('Erreur lors de la génération:', err);
        done(err);
    }
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
