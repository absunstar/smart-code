module.exports = function init(site) {
  const $tickets = site.connectCollection("tickets")

  // function addZero(code, number) {
  //   let c = number - code.toString().length
  //   for (let i = 0; i < c; i++) {
  //     code = '0' + code.toString()
  //   }
  //   return code
  // }

  // $tickets.newCode = function (hospital_id) {
  //   hospital_id = hospital_id || 'x'
  //   let y = new Date().getFullYear().toString().substr(2, 2)
  //   let m = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'][new Date().getMonth()].toString()
  //   let d = new Date().getDate()
  //   let lastCode = site.storage('ticket_last_code_' + hospital_id) || 0
  //   let lastMonth = site.storage('ticket_last_month_' + hospital_id) || m
  //   if (lastMonth != m) {
  //     lastMonth = m
  //     lastCode = 0
  //   }
  //   lastCode++
  //   site.storage('ticket_last_code_' + hospital_id, lastCode)
  //   site.storage('ticket_last_month_' + hospital_id, lastMonth)
  //   return hospital_id + '.' + y + lastMonth + addZero(d, 2) + addZero(lastCode, 4)
  // }

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: "/api/status/all",
    path: __dirname + "/site_files/json/status.json"

  })

  site.post({
    name: "/api/diagnosis/all",
    path: __dirname + "/site_files/json/diagnosis.json"

  })

  site.get({
    name: "tickets",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/tickets/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tickets_doc = req.body
    tickets_doc.$req = req
    tickets_doc.$res = res

    tickets_doc.company = site.get_company(req);
    tickets_doc.branch = site.get_branch(req);

    tickets_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof tickets_doc.active === 'undefined') {
      tickets_doc.active = true
    }

    if (tickets_doc.company_code) {
      tickets_doc.company_codes = [tickets_doc.company_code]
      delete tickets_doc.company_code
    }

    let num_obj = {
      company: site.get_company(req),
      screen: 'tickets_book',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!tickets_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      tickets_doc.code = cb.code;
    }


    $tickets.add(tickets_doc, (err, doc) => {

      if (!err) {
        response.done = true
        response.doc = doc

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/tickets/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tickets_doc = req.body

    tickets_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (tickets_doc.id) {
      $tickets.edit({
        where: {
          id: tickets_doc.id
        },
        set: tickets_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/tickets/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $tickets.findOne({
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

  site.post("/api/tickets/delete", (req, res) => {

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
      $tickets.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
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

  site.post("/api/tickets/update_generate_tickets", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tickets_doc = req.body

    tickets_doc.$req = req
    tickets_doc.$res = res

    tickets_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof tickets_doc.active === 'undefined') {
      tickets_doc.active = true
    }

    if (tickets_doc.company_code) {
      tickets_doc.company_codes = [tickets_doc.company_code]
      delete tickets_doc.company_code
    }

    tickets_doc.selected_doctor = tickets_doc.doctor
    tickets_doc.selected_clinic = tickets_doc.clinic
    tickets_doc.selected_specialty = tickets_doc.doctor.specialty
    tickets_doc.selected_hospital = tickets_doc.hospital
    tickets_doc.selected_shift = tickets_doc.shift

    let search = {}
    search['selected_hospital.id'] = tickets_doc.hospital.id;
    search['selected_clinic.id'] = tickets_doc.clinic.id;
    search['selected_doctor.id'] = tickets_doc.doctor.id;
    search['status.id'] = 5;

    $tickets.deleteMany(search, (err, result) => {
      if (!err) {
        response.done = true

        let find_search = {}

        find_search['selected_hospital.id'] = tickets_doc.hospital.id;
        find_search['selected_clinic.id'] = tickets_doc.clinic.id;
        find_search['selected_doctor.id'] = tickets_doc.doctor.id;
        find_search['status.id'] = { $ne: 5 }

        $tickets.findMany({
          where: find_search,
          sort: { date: -1 },
          limit: 1
        },
          (err, doc_last_ticket) => {

            if (!err) {
              response.done = true
              response.list = doc_last_ticket

              if (doc_last_ticket[0]) {

                let last = new Date(doc_last_ticket[0].date)

                tickets_doc.date = new Date(last.setDate(last.getDate() + 1))

              } else {
                tickets_doc.date = new Date()
              }

              for (let i = 0; i < tickets_doc.period_ticket; i++) {

                let new_ticket = {
                  date: tickets_doc.date,
                  selected_shift: tickets_doc.selected_shift,
                  selected_doctor: tickets_doc.selected_doctor,
                  active: tickets_doc.active,
                  selected_clinic: tickets_doc.selected_clinic,
                  selected_specialty: tickets_doc.selected_specialty,
                  selected_hospital: tickets_doc.selected_hospital,
                }

                new_ticket.date.setDate(new_ticket.date.getDate() + 1)

                tickets_doc.selected_shift.times_list.forEach(_shift => {

                  let start_hour = _shift.from.hour
                  let start_minute = _shift.from.minute

                  let end_hour = _shift.to.hour
                  let end_minute = _shift.to.minute

                  while (new_ticket.date.getDay() !== _shift.day.code) {
                    new_ticket.date.setDate(new_ticket.date.getDate() + 1)
                  }

                  let total_hour_minutes = (end_hour - start_hour) * 60
                  let total_minutes = end_minute - start_minute

                  total_minutes = total_hour_minutes + total_minutes
                  let tickets_count = total_minutes / tickets_doc.selected_doctor.detection_Duration

                  new_ticket.selected_time = {
                    to: _shift.to,
                    from: _shift.from,
                    day: _shift.day
                  }

                  for (let i = 0; i < tickets_count; i++) {

                    let start_date = new Date(new_ticket.date)
                    start_date.setHours(start_hour)
                    start_date.setMinutes(start_minute)

                    start_date.setMinutes(start_date.getMinutes() + (i * tickets_doc.selected_doctor.detection_Duration))

                    let end_date = new Date(start_date)
                    end_date.setMinutes(end_date.getMinutes() + tickets_doc.selected_doctor.detection_Duration)

                    $tickets.add({
                      date: start_date,
                      code: $tickets.newCode(new_ticket.selected_hospital.id),
                      selected_time: {
                        day: new_ticket.selected_time.day,
                        from: {
                          date: start_date,
                          hour: start_date.getHours(),
                          minute: start_date.getMinutes()
                        },
                        to: {
                          date: end_date,
                          hour: end_date.getHours(),
                          minute: end_date.getMinutes()
                        }
                      },
                      selected_shift: new_ticket.selected_shift,
                      selected_doctor: new_ticket.selected_doctor,
                      selected_clinic: new_ticket.selected_clinic,
                      selected_specialty: new_ticket.selected_specialty,
                      selected_hospital: new_ticket.selected_hospital,
                      active: new_ticket.active,
                      status: { id: 5, name: "dont_book", name_en: "Do Not Booking", ar: "لم يتم الحجز" }

                    }, (err, doc) => {
                      if (!err) {
                        response.done = true
                        response.doc = doc
                      } else {
                        response.error = err.message
                      }
                      setTimeout(() => {
                        res.json(response)
                      }, 200);
                    })
                  }
                })
              }
            }
          }
        )
      } else {
        response.error = err.message
      }
    })
  })

  site.post("/api/tickets/generate_tickets", (req, res) => {

    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let tickets_doc = req.body

    tickets_doc.$req = req
    tickets_doc.$res = res

    tickets_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof tickets_doc.active === 'undefined') {
      tickets_doc.active = true
    }

    if (tickets_doc.company_code) {
      tickets_doc.company_codes = [tickets_doc.company_code]
      delete tickets_doc.company_code
    }

    tickets_doc.selected_doctor = tickets_doc.doctor
    tickets_doc.selected_clinic = tickets_doc.clinic
    tickets_doc.selected_specialty = tickets_doc.doctor.specialty
    tickets_doc.selected_hospital = tickets_doc.hospital
    tickets_doc.selected_shift = tickets_doc.shift

    let search = {}

    search['selected_hospital.id'] = tickets_doc.hospital.id;
    search['selected_clinic.id'] = tickets_doc.clinic.id;
    search['selected_doctor.id'] = tickets_doc.doctor.id;

    $tickets.findMany({
      where: search,
      sort: { date: -1 },
      limit: 1
    },
      (err, doc_last_ticket) => {

        if (!err) {
          response.done = true
          response.list = doc_last_ticket

          if (doc_last_ticket[0]) {

            let last = new Date(doc_last_ticket[0].date)

            tickets_doc.date = new Date(last.setDate(last.getDate() + 1))

          } else {
            tickets_doc.date = new Date()
          }

          for (let i = 0; i < tickets_doc.period_ticket; i++) {

            let new_ticket = {
              date: tickets_doc.date,
              selected_shift: tickets_doc.selected_shift,
              selected_doctor: tickets_doc.selected_doctor,
              active: tickets_doc.active,
              selected_clinic: tickets_doc.selected_clinic,
              selected_specialty: tickets_doc.selected_specialty,
              selected_hospital: tickets_doc.selected_hospital,
            }

            new_ticket.date.setDate(new_ticket.date.getDate() + 1)

            tickets_doc.selected_shift.times_list.forEach(_shift => {

              let start_hour = _shift.from.hour
              let start_minute = _shift.from.minute

              let end_hour = _shift.to.hour
              let end_minute = _shift.to.minute

              while (new_ticket.date.getDay() !== _shift.day.code) {
                new_ticket.date.setDate(new_ticket.date.getDate() + 1)
              }

              let total_hour_minutes = (end_hour - start_hour) * 60
              let total_minutes = end_minute - start_minute

              total_minutes = total_hour_minutes + total_minutes
              let tickets_count = total_minutes / tickets_doc.selected_doctor.detection_Duration

              new_ticket.selected_time = {
                to: _shift.to,
                from: _shift.from,
                day: _shift.day
              }

              for (let i = 0; i < tickets_count; i++) {

                let start_date = new Date(new_ticket.date)
                start_date.setHours(start_hour)
                start_date.setMinutes(start_minute)

                start_date.setMinutes(start_date.getMinutes() + (i * tickets_doc.selected_doctor.detection_Duration))

                let end_date = new Date(start_date)
                end_date.setMinutes(end_date.getMinutes() + tickets_doc.selected_doctor.detection_Duration)

                $tickets.add({
                  date: start_date,
                  code: $tickets.newCode(new_ticket.selected_hospital.id),
                  selected_time: {
                    day: new_ticket.selected_time.day,
                    from: {
                      date: start_date,
                      hour: start_date.getHours(),
                      minute: start_date.getMinutes()
                    },
                    to: {
                      date: end_date,
                      hour: end_date.getHours(),
                      minute: end_date.getMinutes()
                    }
                  },
                  selected_shift: new_ticket.selected_shift,
                  selected_doctor: new_ticket.selected_doctor,
                  selected_clinic: new_ticket.selected_clinic,
                  selected_specialty: new_ticket.selected_specialty,
                  selected_hospital: new_ticket.selected_hospital,
                  active: new_ticket.active,
                  status: { id: 5, name: "dont_book", name_en: "Do Not Booking", ar: "لم يتم الحجز" }

                }, (err, doc) => {
                  if (!err) {
                    response.done = true
                    response.doc = doc
                  } else {
                    response.error = err.message
                  }
                  setTimeout(() => {

                    res.json(response)
                  }, 200);
                })
              }
            })
          }
        }
      }
    )
  })

  site.post("/api/tickets/all", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['specialty']) {
      where['selected_specialty.id'] = where['specialty'].id;
      delete where['specialty']
      delete where.active
    }

    if (where['status.id']) {
      where['status.id'] = where['status.id']
    }

    if (where['patient.id']) {
      where['patient.id'] = parseInt(where['patient.id'])
    }

    if (where['address']) {
      where['address'] = new RegExp(where['address'], "i");
    }

    if (where['date_from'] && where['date_to']) {

      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to

    } else if (where['date_from']) {

      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_from)
      d2.setDate(d2.getDate() + 1)

      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
    }

    if (where['doctor_search']) {
      where['selected_doctor.id'] = where['doctor_search'].id;
      delete where['doctor_search']
    }

    if (where['clinic_search']) {
      where['selected_clinic.id'] = where['clinic_search'].id;
      delete where['clinic_search']
    }

    if (where['status_search']) {
      where['status.id'] = where['status_search'].id;
      delete where['status_search']
    }

    if (where['patient_search']) {
      where['patient.id'] = where['patient_search'].id;
      delete where['patient_search']
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $tickets.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        date: -1
      },
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