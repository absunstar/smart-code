module.exports = function init(site) {
    site.get({
        name: 'db',
        path: __dirname + '/site_files/html/index.html',
        parser: 'html',
        compress: false,
    });

    site.post('api/db/import', (req, res) => {

        let response = {
            done: false,
            collection_name: req.headers.collection_name,
            file_path: req.files.collectionFile.path,
        };

        if (req.session.user === undefined) {
            response.error = 'You are not login';
            res.json(response);
            return;
        }

        if(!response.collection_name || response.collection_name == 'default_collection'){
          response.error = 'response.collection_name : ' + response.collection_name;
          res.json(response);
          return;
        }
        if (site.isFileExistsSync(response.file_path)) {
            let $collection = site.connectCollection(response.collection_name);
            let docs = site.fromJson(site.readFileSync(response.file_path).toString());
            if (Array.isArray(docs)) {
                docs.forEach((doc) => {
                    doc.company = site.get_company(req);
                    doc.branch = site.get_branch(req);
                    doc.add_user_info = site.security.getUserFinger({
                        $req: req,
                        $res: res,
                    });
                    $collection.addOne(doc, (err, doc2) => {
                        if (!err && doc) {
                            console.log('import doc id : ' + doc2.id);
                        } else {
                            console.log(err.message);
                        }
                    });
                });
            } else if (site.typeof(docs) === 'Object') {
                doc.company = site.get_company(req);
                doc.branch = site.get_branch(req);
                doc.add_user_info = site.security.getUserFinger({
                    $req: req,
                    $res: res,
                });
                $collection.addOne(docs, (err, doc2) => {
                    if (!err && doc) {
                        console.log('import doc id : ' + doc2.id);
                    } else {
                        console.log(err.message);
                    }
                });
            } else {
                console.log('can not import unknown type : ' + site.typeof(docs));
            }
        } else {
            console.log('file not exists : ' + response.file_path);
        }

        res.json(response);
    });

    site.get('api/db/export', (req, res) => {
        let response = {};
        response.done = false;

        if (req.session.user === undefined) {
            response.error = 'You are not login';
            res.json(response);
            return;
        }
        let collection_name = req.query.name;
        let path = site.path.join(site.options.download_dir, collection_name + '.json');

        site.connectCollection(collection_name).export(
            {
                limit: 1000000,
            },
            path,
            (result) => {
                if (!result.done) {
                    res.json(result);
                } else {
                    res.download(result.file_path);
                }
            },
        );
    });

    site.post('api/db/drop', (req, res) => {
        let response = {
            done: false,
            collection_name: req.body.collection_name,
        };

        if (req.session.user === undefined) {
            response.error = 'You are not login';
            response.body = req.body;
            res.json(response);
            return;
        }
        let $collection = site.connectCollection(response.collection_name);
        $collection.removeMany({}, (err, result) => {
            response.err = err;
            response.result = result;
            response.done = true;
            res.json(response);
        });
    });
};
