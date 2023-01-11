
module.exports = function init(site) {
  const $fileType = site.connectCollection('fileType');
  site.fileTypeList = [];
  $fileType.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.fileTypeList = [...site.fileTypeList, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'fileType',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });


  site.post('/api/fileType/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let fileTypeDoc = req.body;
    fileTypeDoc.$req = req;
    fileTypeDoc.$res = res;

    fileTypeDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof fileTypeDoc.active === 'undefined') {
      fileTypeDoc.active = true;
    }

    $fileType.add(fileTypeDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.fileTypeList.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/fileType/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let fileTypeDoc = req.body;

    fileTypeDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!fileTypeDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $fileType.edit(
      {
        where: {
          id: fileTypeDoc.id,
        },
        set: fileTypeDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.fileTypeList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.fileTypeList[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

  });

  site.post('/api/fileType/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.fileTypeList.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = 'no id'
      res.json(response);
    }
  });

  site.post('/api/fileType/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

   
    if (!req.body.id) {
      response.error = 'no id';
      res.json(response);
      return;
    }

    $fileType.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.fileTypeList.splice(
            site.fileTypeList.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/fileType/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    let select = req.body.select || { id: 1, name: 1 };

    response.list = [];
    site.fileTypeList.forEach((doc) => {
      if ((langDoc = doc.translatedList.find((t) => t.language.id == req.session.lang))) {
        let obj = {
          ...doc,
          ...langDoc,
        };

        for (const p in obj) {
          if (!Object.hasOwnProperty.call(select, p)) {
            delete obj[p];
          }
        }
        if (!where.active || doc.active) {
          response.list.push(obj);
        }
      }
    });

    response.done = true;
    res.json(response);
  });

};