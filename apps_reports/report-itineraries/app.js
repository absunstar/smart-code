module.exports = function init(site) {
  const $itineraries = site.connectCollection("itineraries")

  site.get({
    name: "report_itineraries",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_itineraries/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};

    let delegateId = 0;

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    };

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    };

    if (where['shift_code']) {
      where['shift.code'] = site.get_RegExp(where['shift_code'], 'i')
      delete where['shift_code']
    }

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    }

    if (where['delegate']) {
      delegateId = where['delegate'].id;
      where['delegate.id'] = where['delegate'].id;
      delete where['delegate']

    } else where['delegate.id'] = { $gte: 1 }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $itineraries.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {

        let itineraryList = []

        if (delegateId > 0) {
          docs.forEach(_doc => {
            if (_doc.itinerary_list && _doc.itinerary_list.length > 0)
              _doc.itinerary_list.forEach(_itinerary => {
                _itinerary.itinerary_date = _doc.date
                _itinerary.delegate = _doc.delegate
                itineraryList.push(_itinerary)

              });
          });

        } else if (delegateId === 0) {

          docs.forEach(_doc => {

            let exist = false
            if (_doc.itinerary_list && _doc.itinerary_list.length > 0)
              _doc.itinerary_list.forEach(_itinerary => {
                _itinerary.delegate = _doc.delegate

                if (itineraryList && itineraryList.length > 0) {

                  itineraryList.forEach(_it => {
                    if (_it.delegate.id === _itinerary.delegate.id) {

                      _it.count = _it.count + 1
                      _it.itinerary.push(_itinerary)
                      if (_itinerary.status === 1) {
                        _it.missions_existing = _it.missions_existing + 1
                      } else if (_itinerary.status === 2) {
                        _it.missions_completed = _it.missions_completed + 1

                      } else if (_itinerary.status === 3) {
                        _it.missions_canceled = _it.missions_canceled + 1

                      }
                      exist = true
                    }
                  });

                }

                if (!exist) {

                  let obj_it = { itinerary: _doc.itinerary_list }
                  obj_it.delegate = _itinerary.delegate
                  obj_it.missions_existing = 0
                  obj_it.missions_completed = 0
                  obj_it.missions_canceled = 0
                  obj_it.count = 1
                  if (_itinerary.status === 1) {
                    obj_it.missions_existing =  1
                  } else if (_itinerary.status === 2) {
                    obj_it.missions_completed =  1

                  } else if (_itinerary.status === 3) {
                    obj_it.missions_canceled =  1

                  }
              
                  itineraryList.push(obj_it)
                }
              });

          })

        }
        response.done = true
        response.list = itineraryList
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}