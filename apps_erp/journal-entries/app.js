module.exports = function init(site) {
  const $journal_entries = site.connectCollection("journal_entries")

  site.get({
    name: "journal_entries",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/journal_entries/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let journal_entries_doc = req.body
    journal_entries_doc.$req = req
    journal_entries_doc.$res = res
    journal_entries_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    journal_entries_doc.company = site.get_company(req)
    journal_entries_doc.branch = site.get_branch(req)

    if (journal_entries_doc.creditor !== journal_entries_doc.debtor) {
      response.error = 'debtor_creditor_must_equal';
      res.json(response)
      return
    }

    if (journal_entries_doc.accountingList && journal_entries_doc.accountingList.length > 0) {
      let total_creditor = 0
      let total_debtor = 0
      let found = false
      let accounts_arr = []

      journal_entries_doc.accountingList.forEach(_accList => {
        let rate = 0
        let amount = 0
        let total_account_dibt_credit = 0

        if (_accList.creditor) {
          total_creditor += _accList.creditor
          total_account_dibt_credit += _accList.creditor

        } else if (_accList.debtor) {
          total_debtor += _accList.debtor
          total_account_dibt_credit += _accList.debtor

        }

        if (_accList.cost_list && _accList.cost_list.length > 0) {
          _accList.cost_list.forEach(_costList => {
            rate += _costList.rate
            amount += _costList.amount
          });
        }

        if (rate > 100 || amount > total_account_dibt_credit) {
          found = true
          if (req.session.lang == 'Ar') {
            accounts_arr.push(_accList.name_ar)
          } else if (req.session.lang == 'En') {
            accounts_arr.push(_accList.name_en)
          }
        }
      });


      if (journal_entries_doc.the_amount !== total_creditor || journal_entries_doc.the_amount !== total_debtor) {
        response.error = 'sum_debit_credit_equal_amount';
        res.json(response)
        return
      }

      if (found) {
        response.error = 'ratios_amounts_cost_centers_account';
        response.accounts_arr = accounts_arr;
        res.json(response)
        return
      }

    }

    let num_obj = {
      company: site.get_company(req),
      screen: 'journal_entries',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!journal_entries_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      journal_entries_doc.code = cb.code;
    }

    $journal_entries.add(journal_entries_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/journal_entries/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let journal_entries_doc = req.body
    journal_entries_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (journal_entries_doc.creditor !== journal_entries_doc.debtor) {
      response.error = 'debtor_creditor_must_equal';
      res.json(response)
      return
    }

    if (journal_entries_doc.accountingList && journal_entries_doc.accountingList.length > 0) {
      let total_creditor = 0
      let total_debtor = 0
      let found = false
      let accounts_arr = []

      journal_entries_doc.accountingList.forEach(_accList => {
        let rate = 0
        let amount = 0
        let total_account_dibt_credit = 0

        if (_accList.creditor) {
          total_creditor += _accList.creditor
          total_account_dibt_credit += _accList.creditor

        } else if (_accList.debtor) {
          total_debtor += _accList.debtor
          total_account_dibt_credit += _accList.debtor

        }

        if (_accList.cost_list && _accList.cost_list.length > 0) {
          _accList.cost_list.forEach(_costList => {
            rate += _costList.rate
            amount += _costList.amount
          });
        }

        if (rate > 100 || amount > total_account_dibt_credit) {
          found = true
      if (req.session.lang == 'Ar') {
            accounts_arr.push(_accList.name_ar)
          } else {
            accounts_arr.push(_accList.name_en)
          }
        }
      });



      if (journal_entries_doc.the_amount !== total_creditor || journal_entries_doc.the_amount !== total_debtor) {
        response.error = 'sum_debit_credit_equal_amount';
        res.json(response)
        return
      }

      if (found) {
        response.error = 'ratios_amounts_cost_centers_account';
        response.accounts_arr = accounts_arr;
        res.json(response)
        return
      }

    }

    if (journal_entries_doc.id) {
      $journal_entries.edit({
        where: {
          id: journal_entries_doc.id
        },
        set: journal_entries_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/journal_entries/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $journal_entries.findOne({
      where: {
        id: req.body.id
      }
    }, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/journal_entries/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id

    if (id) {
      $journal_entries.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/journal_entries/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $journal_entries.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}