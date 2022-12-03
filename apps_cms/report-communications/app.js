module.exports = function init(site) {
  const $content = site.connectCollection("content")

  site.get({
    name: "report-communications",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_communications/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let search = req.data.where || {};
    let where = {};
    req.body.select = {
      id: 1,
      date: 1,
      name: 1,
      store: 1,
    }

    if (search.type == 'ads') {
      req.body.select['report_list'] = 1;
      where['report_list.report_type.id'] = { $gt: 0 }
      if (search.date) {
        let d1 = site.toDate(search.date)
        let d2 = site.toDate(search.date)
        d2.setDate(d2.getDate() + 1)
        where['report_list.date'] = {
          '$gte': d1,
          '$lt': d2
        }
      } else if (search && search.date_from) {
        let d1 = site.toDate(search.date_from)
        let d2 = site.toDate(search.date_to)
        d2.setDate(d2.getDate() + 1);
        where['report_list.date'] = {
          '$gte': d1,
          '$lt': d2
        }

      }
    } else if (search.type == 'comments') {
      req.body.select['comment_list'] = 1;
      where['comment_list.report_list.report_type.id'] = { $gt: 0 }

      if (search.date) {
        let d1 = site.toDate(search.date)
        let d2 = site.toDate(search.date)
        d2.setDate(d2.getDate() + 1)
        where['comment_list.report_list.date'] = {
          '$gte': d1,
          '$lt': d2
        }
      } else if (search && search.date_from) {
        let d1 = site.toDate(search.date_from)
        let d2 = site.toDate(search.date_to)
        d2.setDate(d2.getDate() + 1);
        where['comment_list.report_list.date'] = {
          '$gte': d1,
          '$lt': d2
        }

      }

    } else if (search.type == 'replies') {
      req.body.select['comment_list'] = 1;
      where['comment_list.reply_list.report_list.report_type.id'] = { $gt: 0 }
      if (search.date) {
        let d1 = site.toDate(search.date)
        let d2 = site.toDate(search.date)
        d2.setDate(d2.getDate() + 1)
        where['comment_list.reply_list.report_list.date'] = {
          '$gte': d1,
          '$lt': d2
        }
      } else if (search && search.date_from) {
        let d1 = site.toDate(search.date_from)
        let d2 = site.toDate(search.date_to)
        d2.setDate(d2.getDate() + 1);
        where['comment_list.reply_list.report_list.date'] = {
          '$gte': d1,
          '$lt': d2
        }

      }
    }

    if (search['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    };

    if (search['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    };

    /*  if (where['customer']) {
       where['customer.id'] = where['customer'].id;
       delete where['customer']
 
     } else where['customer.id'] = { $gte: 1 }
  */
    /* where['$or'] = [{ 'source_type.id': 2 }, { 'source_type.id': 3 }, { 'source_type.id': 4 }, { 'source_type.id': 7 }] */

    $content.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        let list = [];
        if (search.type == 'ads') {
          docs.forEach(_doc => {
            _doc.report_list = _doc.report_list || [];
            _doc.report_list.forEach(_r => {

              if (_r.report_type && _r.report_type.id) {
                list.push({
                  ad_name: _doc.name,
                  ad_user: _doc.store.user,
                  report_user: _r.user,
                  report_type: _r.report_type,
                  comment_report: _r.comment_report,
                  date: _r.date,
                })
              }
            });
          });
        } else if (search.type == 'comments') {
          docs.forEach(_doc => {
            _doc.comment_list = _doc.comment_list || [];
            _doc.comment_list.forEach(_c => {
              _c.report_list = _c.report_list || [];
              _c.report_list.forEach(_r => {
                if (_r.report_type && _r.report_type.id) {
                  list.push({
                    ad_name: _doc.name,
                    ad_user: _doc.store.user,
                    comment_user: _c.user,
                    comment: _c.comment,
                    report_user: _r.user,
                    report_type: _r.report_type,
                    comment_report: _r.comment_report,
                    date: _r.date,
                  })
                }
              });
            });
          });
        } else if (search.type == 'replies') {
          docs.forEach(_doc => {
            _doc.comment_list = _doc.comment_list || [];
            _doc.comment_list.forEach(_c => {
              _c.reply_list = _c.reply_list || [];
              _c.reply_list.forEach(_reply => {
                _reply.report_list = _reply.report_list || [];
                _reply.report_list.forEach(_r => {
                  if (_r.report_type && _r.report_type.id) {
                    list.push({
                      ad_name: _doc.name,
                      ad_user: _doc.store.user,
                      comment_user: _c.user,
                      comment: _c.comment,
                      reply_user: _reply.user,
                      reply: _reply.comment,
                      report_user: _r.user,
                      report_type: _r.report_type,
                      comment_report: _r.comment_report,
                      date: _r.date,
                    })
                  }
                });
              });
            });
          });
        }
        response.done = true
        response.list = list
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}