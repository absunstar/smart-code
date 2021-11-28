const { date } = require('xlsx/jszip');

module.exports = function init(site) {
    site.XLSX = require('xlsx');
    site.get({
        name: 'db',
        path: __dirname + '/site_files/html/index.html',
        parser: 'html',
        compress: false,
    });
    site.dbMessage = '';
    site.get('api/db/message', (req, res) => {
        res.json({
            done: true,
            message: site.dbMessage,
        });
    });

    site.post('api/db/import', (req, res) => {
        let response = {
            done: false,
            collectionName: req.form.fields.collectionName,
            file: req.form.files.collectionFile,
        };

        if (req.session.user === undefined) {
            response.error = 'You are not login';
            res.json(response);
            return;
        }

        if (!response.collectionName || response.collectionName == 'default_collection') {
            response.error = 'response.collectionName : ' + response.collectionName;
            response.headers = req.headers;
            response.form = req.form;
            res.json(response);
            return;
        }

        if (site.isFileExistsSync(response.file.path)) {
            let $collection = site.connectCollection(response.collectionName);
            let docs = [];
            if (response.file.name.like('*.xlsx')) {
                let workbook = site.XLSX.readFile(response.file.path);
                docs = site.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            } else {
                docs = site.fromJson(site.readFileSync(response.file.path).toString());
            }

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
                            site.dbMessage = 'import doc id : ' + doc2.id;
                            console.log(site.dbMessage);
                        } else {
                            site.dbMessage = err.message;
                            console.log(site.dbMessage);
                        }
                    });
                });
            } else if (site.typeof(docs) === 'Object') {
                docs.company = site.get_company(req);
                docs.branch = site.get_branch(req);
                docs.add_user_info = site.security.getUserFinger({
                    $req: req,
                    $res: res,
                });
                $collection.addOne(docs, (err, doc2) => {
                    if (!err && doc2) {
                        site.dbMessage = 'import doc id : ' + doc2.id;
                        console.log(site.dbMessage);
                    } else {
                        site.dbMessage = err.message;
                        console.log(site.dbMessage);
                    }
                });
            } else {
                site.dbMessage = 'can not import unknown type : ' + site.typeof(docs);
                console.log(site.dbMessage);
            }
        } else {
            site.dbMessage = 'file not exists : ' + response.file.path;
            console.log(site.dbMessage);
        }

        res.json(response);
    });

    site.post('api/db/export', (req, res) => {
        let response = {
            done: false,
        };

        if (req.session.user === undefined) {
            response.error = 'You are not login';
            res.json(response);
            return;
        }

        response.fileType = req.data.fileType || 'json';
        response.collectionName = req.data.collectionName;
        response.file_json_path = site.path.join(site.options.download_dir, response.collectionName + '_' + Date.now() + '.json');
        response.file_xlsx_path = site.path.join(site.options.download_dir, response.collectionName + '_' + Date.now() + '.xlsx');

        site.connectCollection(response.collectionName).findMany(
            {
                limit: 1000000,
                where: req.data.where || {
                    'company.id': site.get_company(req).id,
                    'branch.id': site.get_branch(req).id,
                },
            },
            (err, docs) => {
                if (!err && docs) {
                    if (response.fileType == 'xlsx') {
                        const wb = site.XLSX.utils.book_new();
                        const ws = site.XLSX.utils.json_to_sheet(docs);
                        site.XLSX.utils.book_append_sheet(wb, ws, response.collectionName);
                        site.XLSX.writeFile(wb, response.file_xlsx_path);
                        response.done = !0;
                        res.json(response);
                    } else {
                        site.writeFile(response.file_json_path, JSON.stringify(docs), (err) => {
                            if (err) {
                                response.err = err;
                            } else {
                                response.done = !0;
                            }
                            res.json(response);
                        });
                    }
                } else {
                    response.error = err;
                    res.json(response);
                }
            },
        );
    });

    site.post('api/db/deleteAll', (req, res) => {
        let response = {
            done: false,
            collectionName: req.body.collectionName,
        };

        if (req.session.user === undefined) {
            response.error = 'You are not login';
            response.body = req.body;
            res.json(response);
            return;
        }
        let $collection = site.connectCollection(response.collectionName);
        $collection.removeMany(
            {
                where: {
                    'company.id': site.get_company(req).id,
                    'branch.id': site.get_branch(req).id,
                },
            },
            (err, result) => {
                response.err = err;
                response.result = result;
                response.done = true;
                res.json(response);
            },
        );
    });

    site.get('api/db/download', (req, res) => {
        res.download(req.query.file_path);
    });
};
