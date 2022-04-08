import FS from 'fs';
import GULP from 'gulp';
import BROWSER_SYNC from 'browser-sync';
import { renderEmail } from './converter.js';

exports.serve = GULP.series(compileMJML, GULP.parallel(startBrowserSync, watch));
exports.build = GULP.series(compileMJML);

function compileMJML(done) {
  var test_data_file_path = process.env.npm_config_path;
  if (FS.existsSync(test_data_file_path)) {
    var data_obj = JSON.parse(FS.readFileSync(test_data_file_path, 'utf-8'));
    renderEmail(data_obj.template, data_obj.data)
      .then((response) => {
        FS.writeFile('./build/' + data_obj.template + '.html', response, (err) => {
          if (err) console.log(err);
          done();
        });
      })
      .catch((response) => {
        console.log(response);
        done();
      });
  } else {
    console.log('Could not find file: ' + process.argv[5]);
    done();
  }
}

function watchMJML(done) {
  BROWSER_SYNC.reload();
  done();
}

function watch(done) {
  GULP.watch('src/*', GULP.series(compileMJML, watchMJML));
  GULP.watch('data/*', GULP.series(compileMJML, watchMJML));
  done();
}

function startBrowserSync() {
  return BROWSER_SYNC.init({
    server: {
      baseDir: './build',
    },
    directory: 'build',
  });
}
