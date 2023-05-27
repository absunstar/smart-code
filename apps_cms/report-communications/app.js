module.exports = function init(site) {
  const $content = site.connectCollection("content")

  site.get({
    name: "reportCommunications",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/reportCommunications/all", (req, res) => {
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
    }

    if (search.type == 'ads') {
      req.body.select['reportList'] = 1;
      where['reportList.reportType.id'] = { $gt: 0 }
      if (search.date) {
        let d1 = site.toDate(search.date)
        let d2 = site.toDate(search.date)
        d2.setDate(d2.getDate() + 1)
        where['reportList.date'] = {
          '$gte': d1,
          '$lt': d2
        }
      } else if (search && search.dateFrom) {
        let d1 = site.toDate(search.dateFrom)
        let d2 = site.toDate(search.dateTo)
        d2.setDate(d2.getDate() + 1);
        where['reportList.date'] = {
          '$gte': d1,
          '$lt': d2
        }

      }
    } else if (search.type == 'comments') {
      req.body.select['commentList'] = 1;
      where['commentList.reportList.reportType.id'] = { $gt: 0 }

      if (search.date) {
        let d1 = site.toDate(search.date)
        let d2 = site.toDate(search.date)
        d2.setDate(d2.getDate() + 1)
        where['commentList.reportList.date'] = {
          '$gte': d1,
          '$lt': d2
        }
      } else if (search && search.dateFrom) {
        let d1 = site.toDate(search.dateFrom)
        let d2 = site.toDate(search.dateTo)
        d2.setDate(d2.getDate() + 1);
        where['commentList.reportList.date'] = {
          '$gte': d1,
          '$lt': d2
        }

      }

    } else if (search.type == 'replies') {
      req.body.select['commentList'] = 1;
      where['commentList.replyList.reportList.reportType.id'] = { $gt: 0 }
      if (search.date) {
        let d1 = site.toDate(search.date)
        let d2 = site.toDate(search.date)
        d2.setDate(d2.getDate() + 1)
        where['commentList.replyList.reportList.date'] = {
          '$gte': d1,
          '$lt': d2
        }
      } else if (search && search.dateFrom) {
        let d1 = site.toDate(search.dateFrom)
        let d2 = site.toDate(search.dateTo)
        d2.setDate(d2.getDate() + 1);
        where['commentList.replyList.reportList.date'] = {
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
            _doc.reportList = _doc.reportList || [];
            _doc.reportList.forEach(_r => {

              if (_r.reportType && _r.reportType.id) {
                list.push({
                  adName: _doc.name,
                  adUser: _doc.store.user,
                  reportUser: _r.user,
                  reportType: _r.reportType,
                  commentReport: _r.commentReport,
                  date: _r.date,
                })
              }
            });
          });
        } else if (search.type == 'comments') {
          docs.forEach(_doc => {
            _doc.commentList = _doc.commentList || [];
            _doc.commentList.forEach(_c => {
              _c.reportList = _c.reportList || [];
              _c.reportList.forEach(_r => {
                if (_r.reportType && _r.reportType.id) {
                  list.push({
                    adName: _doc.name,
                    adUser: _doc.store.user,
                    comment_user: _c.user,
                    comment: _c.comment,
                    reportUser: _r.user,
                    reportType: _r.reportType,
                    commentReport: _r.commentReport,
                    date: _r.date,
                  })
                }
              });
            });
          });
        } else if (search.type == 'replies') {
          docs.forEach(_doc => {
            _doc.commentList = _doc.commentList || [];
            _doc.commentList.forEach(_c => {
              _c.replyList = _c.replyList || [];
              _c.replyList.forEach(_reply => {
                _reply.reportList = _reply.reportList || [];
                _reply.reportList.forEach(_r => {
                  if (_r.reportType && _r.reportType.id) {
                    list.push({
                      adName: _doc.name,
                      adUser: _doc.store.user,
                      comment_user: _c.user,
                      comment: _c.comment,
                      replyUser: _reply.user,
                      reply: _reply.comment,
                      reportUser: _r.user,
                      reportType: _r.reportType,
                      commentReport: _r.commentReport,
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