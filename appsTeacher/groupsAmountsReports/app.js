module.exports = function init(site) {
  let app = {
    name: "groupsAmountsReports",
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
  site.get(
    {
      name: app.name,
    },
    (req, res) => {
      res.render(
        app.name + "/index.html",
        {
          title: app.name,
          appName: req.word("Groups Amounts Reports"),
          setting: site.getSiteSetting(req.host),
        },
        { parser: "html css js", compres: true }
      );
    }
  );

  site.post(
    {
      name: `/api/${app.name}/getGroupAmount`,
      require: { permissions: ["login"] },
    },
    (req, res) => {
      let response = {
        done: false,
      };

      let where = req.data;
      if (where.dateFrom > where.ToFrom) {
        response.error = "Dates is Wrong";
        res.json(response);
        return;
      }
      let result = {
        
        list: [],
        totalRequired: 0,
        totalPaid: 0,
        totalRemain: 0,
      };
      site.getGroup({ id: where.group.id }, (err, group) => {
        if (!err && group) {
          response.done = true;
          site.getPreparingGroups({ ...where }, (err, preparingGroup) => {
            if (group.paymentMethod.name == "lecture") {
              if (preparingGroup && preparingGroup.length > 0) {
                for (let i = 0; i < preparingGroup.length; i++) {
                  preparingGroup[i].studentList.forEach((_s) => {
                    _s.requiredPayment = _s.requiredPayment || 0;
                    let index = result.list.findIndex((itm) => itm.student && itm.student.id === _s.student.id);
                    if (index !== -1) {
                      if (_s.attend) {
                        result.list[index].paymentList.push(_s);
                        result.list[index].totalRequired += _s.requiredPayment;
                        if (_s.attend && !_s.exempt) {
                          if (_s.paidType == "donePaid") {
                            result.totalPaid += _s.requiredPayment;
                            result.list[index].totalPaid += _s.requiredPayment;
                          }
                          if (_s.paidType == "notPaid") {
                            result.totalRemain += _s.requiredPayment;
                            result.list[index].totalRemain += _s.requiredPayment;
                          }
                        }
                      }
                    } else {
                      let obj = {
                        student: _s.student,
                        attend: _s.attend ? 1 : 0,
                        absence: _s.attend ? 0 : 1,
                        paymentList: [_s],
                      };
                      if (_s.attend) {
                        if (_s.exempt) {
                          obj.totalRequired = 0;
                          obj.totalPaid = 0;
                          obj.totalRemain = 0;
                        } else {
                          obj.totalRequired = _s.requiredPayment;
                          result.totalRequired += _s.requiredPayment;
                          if (_s.paidType == "donePaid") {
                            result.totalPaid += _s.requiredPayment;
                          }
                          if (_s.paidType == "notPaid") {
                            result.totalRemain += _s.requiredPayment;
                          }
                          obj.totalPaid = _s.paidType == "donePaid" ? _s.requiredPayment : 0;
                          obj.totalRemain = _s.paidType == "notPaid" ? _s.requiredPayment : 0;
                        }
                      } else {
                        obj.totalRequired = 0;
                        obj.totalPaid = 0;
                        obj.totalRemain = 0;
                      }
                      result.list.push(obj);
                    }
                  });
                }
              }
              response.result = result;
              res.json(response);
            } else {
              let dateFrom = where.dateFrom ? new Date(where.dateFrom) : null;
              let dateTo = where.dateTo ? new Date(where.dateTo) : null;
              // dateTo1.setMonth(dateTo1.getMonth() + 1);

              for (let i = 0; i < group.studentList.length; i++) {
                let dateFrom1 = where.dateFrom ? new Date(where.dateFrom) : null;
                let dateTo1 = where.dateTo ? new Date(where.dateTo) : null;
                let monthList = [];
                while (dateFrom1 < dateTo1) {
                  monthList.push({ month: dateFrom1.getMonth(), year: dateFrom1.getFullYear(), isFound: false });
                  dateFrom1.setMonth(dateFrom1.getMonth() + 1);
                }
                let obj = {
                  student: group.studentList[i].student,
                  paymentList: [],
                  totalRequired: 0,
                  totalPaid: 0,
                  totalRemain: 0,
                };
                group.studentList[i].paymentList = group.studentList[i].paymentList || [];

                group.studentList[i].paymentList.forEach((_p) => {
                  _p.date = new Date(_p.date);
                  let indx = monthList.findIndex((itm) => itm.month == _p.date.getMonth() && itm.year == _p.date.getFullYear());
                  if (indx !== -1) {
                    monthList[indx].isFound = true;
                  }
                  if (_p.date.getTime() <= dateTo.getTime() && _p.date.getTime() >= dateFrom.getTime()) {
                    obj.totalRequired += _p.price + _p.remain;
                    obj.totalPaid += _p.price;
                    obj.totalRemain += _p.remain;
                    result.totalRequired += _p.price + _p.remain;
                    result.totalPaid += _p.price;
                    result.totalRemain += _p.remain;
                    obj.paymentList.unshift(_p);
                  }
                });
                monthList.forEach((_m) => {
                  if (!_m.isFound) {
                    let indx = preparingGroup.findIndex((k) => new Date(k.date).getMonth() == _m.month && new Date(k.date).getFullYear() == _m.year);
                    if (indx !== -1 && preparingGroup[indx].studentList.some((k) => k.student.id === group.studentList[i].student.id && k.attend)) {
                      obj.totalRequired += group.studentList[i].requiredPayment;
                      obj.totalRemain += group.studentList[i].requiredPayment;
                      result.totalRequired += group.studentList[i].requiredPayment;
                      result.totalRemain += group.studentList[i].requiredPayment;
                    }
                  }
                });
                result.list.push(obj);
              }

              response.result = result;
              res.json(response);
            }
          });
        } else {
          response.error = err.mesage || "Not Found";
          res.json(response);
        }
      });
    }
  );

  site.addApp(app);
};
