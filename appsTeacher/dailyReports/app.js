module.exports = function init(site) {
  let app = {
    name: "dailyReports",
    allowMemory: false,
    memoryList: [],
    allowCache: false,
    cacheList: [],
    allowRoute: true,
    allowRouteGet: true,
    allowRouteAdd: true,
    allowRouteUpdate: true,
    allowRouteDelete: true,
    allowRouteView: true,
    allowRouteAll: true,
  };
  app.$collectionGroup = site.connectCollection("groups");
  app.$collectionPrepareGroup = site.connectCollection("preparingGroups");

  site.get(
    {
      name: app.name,
    },
    (req, res) => {
      res.render(
        app.name + "/index.html",
        {
          title: app.name,
          appName: req.word("Daily Reports"),
          setting: site.getSiteSetting(req.host),
        },
        { parser: "html css js", compres: true }
      );
    }
  );

  site.post(
    {
      name: `/api/${app.name}/getAmounts`,
      require: { permissions: ["login"] },
    },
    (req, res) => {
      let response = {
        done: false,
      };
      let host = site.getHostFilter(req.host);

      let where = req.data;
      if (where.dateFrom > where.dateTo || !where.dateTo) {
        response.error = "Dates is Wrong";
        res.json(response);
        return;
      }
      let result = {
        list: [],
        // totalRequired: 0,
        totalPaid: 0,
        // totalRemain: 0,
      };
      let studentList = site.getStudents({ host: host });

      let where1 = {};
      let where2 = {};
      let d1 = site.toDate(where.dateFrom);
      let d2 = site.toDate(where.dateTo);
      d2.setDate(d2.getDate() + 1);
      where1["studentList.paymentList.date"] = { $gte: d1, $lt: d2 };
      where2.date = { $gte: d1, $lt: d2 };
      // app.$collectionGroup.findMany(where1, (err, groups) => {
      //   app.$collectionPrepareGroup.findMany(where2, (err, preparingGroups) => {
      site.getGroups({ ...where1 }, (err, groups) => {
        site.getPreparingGroups({ ...where2 }, (err, preparingGroups) => {
          if (!err && groups) {
            response.done = true;

            for (let i = 0; i < groups.length; i++) {
              if (groups[i].paymentMethod.name == "monthly") {
                let dateFrom = where.dateFrom ? site.getDate(where.dateFrom) : null;
                let dateTo = where.dateTo ? site.getDate(where.dateTo) : null;
                groups[i]?.studentList?.forEach((_s) => {
                  let dateFrom1 = where.dateFrom ? site.getDate(where.dateFrom) : null;
                  let dateTo1 = where.dateTo ? site.getDate(where.dateTo) : null;
                  let monthList = [];
                  while (dateFrom1 < dateTo1) {
                    monthList.push({ month: dateFrom1.getMonth(), year: dateFrom1.getFullYear(), isFound: false });
                    dateFrom1.setMonth(dateFrom1.getMonth() + 1);
                  }
                  console.log(monthList,_s.student.firstName);
                  
                  let pay = {
                    groupId: groups[i].id,
                    studentId: _s.student.id,
                    price: 0,
                    remain: 0,
                  };
                  _s?.paymentList?.forEach((_p) => {
                    _p.date = site.getDate(_p.date);
                    let indx = monthList.findIndex((itm) => itm.month == _p.date.getMonth() && itm.year == _p.date.getFullYear());
                    if (indx !== -1) {
                      monthList[indx].isFound = true;
                    }
                    if (_p.date.getTime() <= dateTo.getTime() && _p.date.getTime() >= dateFrom.getTime()) {
                      pay.price += _p.price || 0;
                      pay.remain += _p.remain;
                    }
                  });
                  monthList.forEach((_m) => {
                    if (!_m.isFound) {                      
                      pay.remain += _s.requiredPayment;
                    }
                  });
                  let index = studentList.findIndex((itm) => itm.id === _s.student.id);
                  if (index !== -1) {
                    studentList[index].paid = studentList[index].paid ? (studentList[index].paid += pay.price || 0) : pay.price || 0;
                    studentList[index].remain = studentList[index].remain ? (studentList[index].remain += pay.remain || 0) : pay.remain || 0;
                  }
                });
              }
            }
            if (preparingGroups instanceof Array) {
              for (let i = 0; i < preparingGroups.length; i++) {
                if (preparingGroups[i].group?.paymentMethod?.name == "lecture") {
                  preparingGroups[i].studentList.forEach((_s) => {
                    _s.requiredPayment = _s.requiredPayment || 0;
                    if (_s.attend) {
                      let index = studentList.findIndex((itm) => itm.id === _s.student.id);

                      if (index !== -1) {
                        if (_s.attend && !_s.exempt) {
                          if (_s.paidType == "donePaid") {
                            studentList[index].paid = studentList[index].paid ? (studentList[index].paid += _s.requiredPayment) : _s.requiredPayment;
                          } else if (_s.paidType == "notPaid") {
                            studentList[index].remain = studentList[index].remain ? (studentList[index].remain += _s.requiredPayment) : _s.requiredPayment;
                          }
                        }
                      }
                    }
                  });
                }
              }
            }

            response.list = studentList;

            res.json(response);
          } else {
            response.error = err.mesage || "Not Found";
            res.json(response);
          }
        });
      });
    }
  );

  site.addApp(app);
};
