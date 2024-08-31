module.exports = function init(site) {
  let app = {
    name: "studentAmountsReports",
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
          appName: req.word("Student Amounts Reports"),
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
      site.getGroups({ "studentList.student.id": where.student.id, "paymentMethod.name": "monthly" }, (err, groups) => {
        if (!err && groups) {
          response.done = true;
          site.getPreparingGroups({ ...where }, (err, preparingGroup) => {
            if (preparingGroup instanceof Array) {
              for (let i = 0; i < preparingGroup.length; i++) {
                if (preparingGroup[i].group.paymentMethod.name == "lecture") {
                  let studentObj = preparingGroup[i].studentList.find((itm) => itm.student.id == where.student.id);

                  studentObj.requiredPayment = studentObj.requiredPayment || 0;
                  let index = result.list.findIndex((itm) => itm.group && itm.group.id === preparingGroup[i].group.id);
                  if (index !== -1) {
                    if (studentObj.attend) {
                      result.list[index].paymentList.push({
                        attend: studentObj.attend,
                        date: preparingGroup[i].date,
                        day: preparingGroup[i].day,
                        requiredPayment: studentObj.requiredPayment,
                        paid: studentObj.paidType == "donePaid" ? studentObj.requiredPayment : 0,
                        remain: studentObj.paidType == "notPaid" ? studentObj.requiredPayment : 0,
                        paidType: studentObj.paidType,
                      });
                      result.list[index].totalRequired += studentObj.requiredPayment;
                      if (studentObj.attend && !studentObj.exempt) {
                        if (studentObj.paidType == "donePaid") {
                          result.totalPaid += studentObj.requiredPayment;
                          result.list[index].totalPaid += studentObj.requiredPayment;
                        }
                        if (studentObj.paidType == "notPaid") {
                          result.totalRemain += studentObj.requiredPayment;
                          result.list[index].totalRemain += studentObj.requiredPayment;
                        }
                      }
                    }
                  } else {
                    
                    let obj = {
                      group: preparingGroup[i].group,
                      subject: preparingGroup[i].subject,
                      teacher: preparingGroup[i].teacher,
                      paymentList: [
                        {
                          attend: studentObj.attend,
                          date: preparingGroup[i].date,
                          new: studentObj.new,
                          day: preparingGroup[i].day,
                          requiredPayment: studentObj.requiredPayment,
                          paid: studentObj.paidType == "donePaid" ? studentObj.requiredPayment : 0,
                          remain: studentObj.paidType == "notPaid" ? studentObj.requiredPayment : 0,
                          paidType: studentObj.paidType,
                        },
                      ],
                    };
                    if (studentObj.attend) {
                      if (studentObj.exempt) {
                        obj.totalRequired = 0;
                        obj.totalPaid = 0;
                        obj.totalRemain = 0;
                      } else {
                        obj.totalRequired = studentObj.requiredPayment;
                        result.totalRequired += studentObj.requiredPayment;
                        if (studentObj.paidType == "donePaid") {
                          result.totalPaid += studentObj.requiredPayment;
                        }
                        if (studentObj.paidType == "notPaid") {
                          result.totalRemain += studentObj.requiredPayment;
                        }
                        obj.totalPaid = studentObj.paidType == "donePaid" ? studentObj.requiredPayment : 0;
                        obj.totalRemain = studentObj.paidType == "notPaid" ? studentObj.requiredPayment : 0;
                      }
                    } else {
                      obj.totalRequired = 0;
                      obj.totalPaid = 0;
                      obj.totalRemain = 0;
                    }
                    result.list.push(obj);
                  }
                }
              }
            }
            if (groups instanceof Array) {
              let dateFrom = where.dateFrom ? new Date(where.dateFrom) : null;
              let dateTo = where.dateTo ? new Date(where.dateTo) : null;
              // dateTo1.setMonth(dateTo1.getMonth() + 1);
              for (let i = 0; i < groups.length; i++) {
                let studentObj = groups[i].studentList.find((s) => s.student.id == where.student.id);
                let dateFrom1 = where.dateFrom ? new Date(where.dateFrom) : null;
                let dateTo1 = where.dateTo ? new Date(where.dateTo) : null;
                let monthList = [];
                while (dateFrom1 < dateTo1) {
                  monthList.push({ month: dateFrom1.getMonth(), year: dateFrom1.getFullYear(), isFound: false });
                  dateFrom1.setMonth(dateFrom1.getMonth() + 1);
                }
                let obj = {
                  group: {
                    id: groups[i].id,
                    name: groups[i].name,
                    paymentMethod: groups[i].paymentMethod,
                  },
                  teacher: groups[i].teacher,
                  subject: groups[i].subject,
                  paymentList: [],
                  totalRequired: 0,
                  totalPaid: 0,
                  totalRemain: 0,
                };
                studentObj.paymentList = studentObj.paymentList || [];

                studentObj.paymentList.forEach((_p) => {
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
                    if (indx !== -1 && preparingGroup[indx].studentList.some((k) => k.student.id === studentObj.student.id && k.attend)) {
                      obj.totalRequired += studentObj.requiredPayment;
                      obj.totalRemain += studentObj.requiredPayment;
                      result.totalRequired += studentObj.requiredPayment;
                      result.totalRemain += studentObj.requiredPayment;
                    }
                  }
                });
                result.list.push(obj);
              }
            }

            response.result = result;

            res.json(response);
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
