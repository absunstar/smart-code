module.exports = function init(site) {
  const $words = site.connectCollection('words');

  site.get(
    {
      name: 'words',
    },
    (req, res) => {
      res.render(
        'words' + '/index.html',
        {
          title: 'words',
          appName: 'Words',
          setting: site.getSiteSetting(req.host),
        },
        { parser: 'html', compres: true }
      );
    }
  );

  site.post({ name: '/api/words/importNewOnly' }, (req, res) => {
    let response = {
      done: false,
      file: req.form.files.fileToUpload,
    };

    if (site.isFileExistsSync(response.file.filepath)) {
      let docs = [];
      if (response.file.originalFilename.like('*.xls*')) {
        let workbook = site.XLSX.readFile(response.file.filepath);
        docs = site.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      } else {
        docs = site.fromJson(site.readFileSync(response.file.filepath).toString());
      }

      if (Array.isArray(docs)) {
        for (let i = 0; i < docs.length; i++) {
          delete docs[i].id;
          delete docs[i]._id;
          site.words.add(docs[i]);
        }

        site.words.save();
      } else {
        response.error = 'can not import unknown type : ' + site.typeof(docs);
      }
    } else {
      response.error = 'file not exists : ' + response.file.filepath;
    }
    res.json(response);
  });
  site.post({ name: '/api/words/importAndReplace' }, (req, res) => {
    let response = {
      done: false,
      file: req.form.files.fileToUpload,
    };

    if (site.isFileExistsSync(response.file.filepath)) {
      let docs = [];
      if (response.file.originalFilename.like('*.xls*')) {
        let workbook = site.XLSX.readFile(response.file.filepath);
        docs = site.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      } else {
        docs = site.fromJson(site.readFileSync(response.file.filepath).toString());
      }

      if (Array.isArray(docs)) {
        for (let i = 0; i < docs.length; i++) {
          delete docs[i].id;
          delete docs[i]._id;
          site.words.set(docs[i]);
        }

        site.words.save();
      } else {
        response.error = 'can not import unknown type : ' + site.typeof(docs);
      }
    } else {
      response.error = 'file not exists : ' + response.file.filepath;
    }
    res.json(response);
  });

  site.post({ name: `/x-api/words/export`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    $words.findMany({}, (err, wordsList) => {
      if (!err && wordsList) {
        response.done = true;
        site.fs.writeFileSync('wordsFileLawyer.json', JSON.stringify(wordsList));
      } else {
        response.error = err?.message || 'Not Exists';
      }
      res.json(response);
    });
  });

  site.post({ name: `/x-api/words/reset`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    $words.deleteMany({}, (err, doc) => {
      response.done = true;
      res.json(response);
    });
  });
};
