module.exports = function init(site) {
  const $words = site.connectCollection("words")

  site.get(
    {
        name: 'words',
    },
    (req, res) => {
        res.render('words' + '/index.html', { title: 'words', appName: 'Governorates', setting: site.getSiteSetting(req.host) }, { parser: 'html', compres: true });
    }
);

  site.post({ name: "/x-api/words/importNewWords" }, (req, res) => {
    let response = {
      done: false,
      file: req.form.files.fileToUpload,
    };

    if (site.isFileExistsSync(response.file.filepath)) {
      let docs = [];
      if (response.file.originalFilename.like("*.xls*")) {
        let workbook = site.XLSX.readFile(response.file.filepath);
        docs = site.XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        );
      } else {
        docs = site.fromJson(
          site.readFileSync(response.file.filepath).toString()
        );
      }

      if (Array.isArray(docs)) {
        for (let i = 0; i < docs.length; i++) {
          site.words.add(docs[i]);
        }

        site.words.save();
      } else {
        site.dbMessage = "can not import unknown type : " + site.typeof(docs);
        console.log(site.dbMessage);
      }
    } else {
      site.dbMessage = "file not exists : " + response.file.filepath;
      console.log(site.dbMessage);
    }
  });

  site.post({ name: "/x-api/words/importReplaceWords" }, (req, res) => {
    let response = {
      done: false,
      file: req.form.files.fileToUpload,
    };
    if (site.isFileExistsSync(response.file.filepath)) {
      let wordsList = [];
      if (response.file.originalFilename.like("*.xls*")) {
        let workbook = site.XLSX.readFile(response.file.filepath);
        wordsList = site.XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        );
      } else {
        wordsList = site.fromJson(
          site.readFileSync(response.file.filepath).toString()
        );
      }
      if (Array.isArray(wordsList)) {
        $words.findMany({}, (err, docs) => {
          let num = 0;
          let num2 = 0;
          for (let i = 0; i < wordsList.length; i++) {
            if (wordsList[i].Ar || wordsList[i].En) {
              let index = docs.findIndex(
                (w) =>
                  w.name == wordsList[i].name ||
                  w.Ar == wordsList[i].Ar ||
                  w.En == wordsList[i].En
              );
              if (index != -1) {
                num += 1;
                site.words.set(wordsList[i]);
              } else {
                num2 += 1;
                site.words.add(wordsList[i]);
              }
            }
          }
          site.words.save();
        });
      } else {
        site.dbMessage =
          "can not import unknown type : " + site.typeof(wordsList);
        console.log(site.dbMessage);
      }
    } else {
      site.dbMessage = "file not exists : " + response.file.filepath;
      console.log(site.dbMessage);
    }
  });

  site.post({ name: `/x-api/words/export`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    $words.findMany({}, (err, wordsList) => {
      if (!err && wordsList) {
        response.done = true;
        site.fs.writeFileSync("wordsFile.json", JSON.stringify(wordsList));
      } else {
        response.error = err?.message || "Not Exists";
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
