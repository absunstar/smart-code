app.controller("groups", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.setting = site.showObject(`##data.#setting##`);
  $scope.appName = "groups";
  $scope.isOpen = false;
  $scope.modalID = "#groupsManageModal";
  $scope.modalSearchID = "#groupsSearchModal";
  $scope.mode = "add";
  $scope._search = {};
  $scope.structure = {
    image: {},
    active: true,
  };
  $scope.item = {};
  $scope.list = [];

  $scope.showAdd = function (_item) {
    $scope.error = "";
    $scope.isOpen = false;
    $scope.mode = "add";
    $scope.item = { ...$scope.structure, dayList: [], studentList: [] };
    site.showModal($scope.modalID);
  };

  $scope.add = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/add`,
      data: $scope.item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
          $scope.list.unshift(response.data.doc);
        } else {
          $scope.error = response.data.error;
          if (response.data.error && response.data.error.like("*Must Enter Code*")) {
            $scope.error = "##word.Must Enter Code##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showUpdate = function (_item) {
    $scope.error = "";
    $scope.mode = "edit";
    $scope.view(_item);
    $scope.item = {};
    site.showModal($scope.modalID);
  };

  $scope.update = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/update`,
      data: { item: _item },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
          let index = $scope.list.findIndex((itm) => itm.id == response.data.result.id);
          if (index !== -1) {
            $scope.list[index] = response.data.result;
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showView = function (_item) {
    $scope.error = "";
    $scope.mode = "view";
    $scope.item = {};
    $scope.view(_item);
    site.showModal($scope.modalID);
  };

  $scope.view = function (_item) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/view`,
      data: {
        id: _item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
          $scope.isOpen = false;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showDelete = function (_item) {
    $scope.error = "";
    $scope.mode = "delete";
    $scope.item = {};
    $scope.view(_item);
    site.showModal($scope.modalID);
  };

  $scope.delete = function (_item) {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/delete`,
      data: {
        id: $scope.item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
          if (index !== -1) {
            $scope.list.splice(index, 1);
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getAll = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/all`,
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal($scope.modalSearchID);
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getWeekDaysList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/weekDays",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.weekDaysList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSubjectsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/subjects/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name: 1 },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.subjectsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getStudent = function (ev, $search) {
    $scope.error = "";
    if (ev.which !== 13 || !$search) {
      return;
    }

    if (!$scope.item.educationalLevel || !$scope.item.educationalLevel.id || !$scope.item.schoolYear || !$scope.item.schoolYear.id) {
      $scope.error = "##word.Data Not Completed##";
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manageUsers/byBarcode",
      data: {
        where: {
          barcode: $search,
          type: "student",
          "educationalLevel.id": $scope.item.educationalLevel.id,
          "schoolYear.id": $scope.item.schoolYear.id,
          active: true,
        },
        select: { id: 1, firstName: 1, barcode: 1, mobile: 1, parentMobile: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          if (!$scope.item.studentList.some((k) => k.student && k.student.id === response.data.doc.id)) {
            $scope.item.studentList.unshift({ student: response.data.doc, attend: false, discount: 0, discountValue: 0, requiredPayment: $scope.item.price });
          } else {
            $scope.error = "##word.Student Exist##";
          }
        } else {
          $scope.error = "##word.Not Found##";
        }

        $scope.item.$studentSearch = "";
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getTeachersList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manageUsers/all",
      data: {
        search: $search,
        where: {
          type: "teacher",
          active: true,
        },
        select: { id: 1, firstName: 1, image: 1, prefix: 1, mobile: 1, subject: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.teachersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGroupPaymentMethodList = function () {
    $scope.busy = true;
    $scope.groupPaymentMethodList = [];

    $http({
      method: "POST",
      url: "/api/groupPaymentMethodList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.groupPaymentMethodList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getMonthList = function () {
    $scope.busy = true;
    $scope.monthList = [];

    $http({
      method: "POST",
      url: "/api/monthList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.monthList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getEducationalLevelsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.educationalLevelsList = [];

    $http({
      method: "POST",
      url: "/api/educationalLevels/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.educationalLevelsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSchoolYearsList = function (educationalLevelId) {
    $scope.busy = true;
    $scope.schoolYearsList = [];
    $http({
      method: "POST",
      url: "/api/schoolYears/all",
      data: {
        where: {
          active: true,
          "educationalLevel.id": educationalLevelId,
        },
        select: {
          id: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.schoolYearsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.clickMoblie = function (item, type) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/clickMobile`,
      data: { id: $scope.item.id, studentId: item.student.id, type: type },
    }).then(
      function (response) {
        $scope.busy = false;
        if (type == "studentMobile") {
          item.clickStudentMoblie = true;
        } else if (type == "parentMobile") {
          item.clickSParentMobile = true;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.autoSave = function () {
    setInterval(function () {
      if ($scope.isOpen) {
        $scope.save();
      }
    }, 1000 * 30);
  };
  $scope.autoSave();
  $scope.showStudentsModal = function (_item) {
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/view`,
      data: {
        id: _item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
          $scope.isOpen = true;
          site.showModal("#studentsModal");
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.save = function (type) {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/update`,
      data: { item: $scope.item, auto: true },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (type == "close") {
            site.hideModal("#studentsModal");
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.removeStudent = function (item) {
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/preparingGroups/removeStudentFromPreparingGroups`,
      data: { studentId: item.student.id, groupId: $scope.item.id },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item.studentList = $scope.item.studentList.filter(function (itm) {
            return itm.student.id !== item.student.id;
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  
  };

  $scope.generateAppointments = function (item) {
    $scope.error = "";
    if (item.startDate && item.endDate) {
      let start = site.getDate(item.startDate);
      let end = site.getDate(item.endDate);
      /* end.setHours(0, 0, 0, 0); */
      item.dayList = [];
      let index = item.days.findIndex((itm) => itm.code === start.getDay());
      if (index !== -1) {
        item.dayList.push({ date: site.getDate(start), day: item.days[index] });
      }
      while (site.getDate(start) <= site.getDate(end)) {
        start.setTime(start.getTime() + 1 * 24 * 60 * 60 * 1000);
        let index = item.days.findIndex((itm) => itm.code === start.getDay());
        if (index !== -1 && site.getDate(start) <= site.getDate(end)) {
          item.dayList.push({ date: site.getDate(start), day: item.days[index] });
        }
        if (site.getDate(start) == site.getDate(end)) {
          break;
        }
      }
    }
  };

  $scope.changeDay = function (item) {
    $scope.error = "";
    item.date = site.getDate(item.date);
    item.date.setHours(0, 0, 0, 0);
    let index = $scope.weekDaysList.findIndex((itm) => itm.code === item.date.getDay());
    if (index !== -1) {
      item.day = $scope.weekDaysList[index];
    }
  };

  $scope.selectTeacher = function () {
    $scope.error = "";
    $scope.item.subject = { ...$scope.item.teacher.subject };
  };

  $scope.pushSpceficIndex = function (index) {
    $scope.error = "";
    $scope.dayList.splice(index, 0, { date: site.getDate() });
  };

  $scope.showSearch = function () {
    $scope.error = "";
    site.showModal($scope.modalSearchID);
  };

  $scope.thermalPrint = function (obj, subObj) {
    $scope.error = "";
    if ($scope.busy) return;
    $scope.busy = true;
    if ($scope.setting.thermalPrinter) {
      $("#thermalPrint").removeClass("hidden");
      $scope.thermal = {
        printDate: site.getDate(),
        date: subObj.date,
        month: obj.month,
        groupName: $scope.item.name,
        student: $scope.studentItem.student,
        price: subObj.price,
        remain: obj.remain,
        totalNet: obj.price,
      };

      let printer = $scope.setting.thermalPrinter;
      if ("##user.thermalPrinter##" && "##user.thermalPrinter.id##" > 0) {
        printer = JSON.parse("##user.thermalPrinter##");
      }
      $timeout(() => {
        site.print({
          selector: "#thermalPrint",
          ip: printer.ipDevice,
          port: printer.portDevice,
          pageSize: "Letter",
          printer: printer.ip.name.trim(),
          dpi: { horizontal: 200, vertical: 600 },
        });
      }, 500);
    } else {
      $scope.error = "##word.Thermal Printer Must Select##";
    }
    $scope.busy = false;
    $timeout(() => {
      $("#thermalPrint").addClass("hidden");
    }, 8000);
  };

  $scope.showStudentPayments = function (item) {
    $scope.error = "";

    $scope.studentGroupItem = $scope.item;
    $scope.studentItem = item;
    $scope.studentItem.$date = site.getDate();
    let index = $scope.monthList.findIndex((itm) => itm.code == $scope.studentItem.$date.getMonth());
    if (index !== -1) {
      $scope.studentItem.$month = $scope.monthList[index];
    }
    $scope.calcRequiredPayment(item);
    site.showModal("#paymentsModal");
  };

  $scope.changePaymentMonth = function (item) {
    $scope.error = "";
    item.$date = site.getDate(item.$date);
    let index = $scope.monthList.findIndex((itm) => itm.code == item.$date.getMonth());
    if (index !== -1) {
      item.$month = $scope.monthList[index];
    }
  };

  $scope.addStudentPayment = function (item) {
    $scope.error = "";

    item.paymentList = item.paymentList || [];
    if (item.$price > $scope.studentItem.requiredPayment) {
      $scope.error = "##word.The amount paid is greater than what was required to be paid##";
      return;
    }
    if (item.$date && item.$month && item.$month.name && item.$price > 0) {
      if (item.paymentList.some((p) => p.month.name == item.$month.name)) {
        $scope.error = "##word.This Month Is Exist##";
        return;
      }
      item.paymentList.unshift({ date: item.$date, discount :item.discount , price: item.$price, month: item.$month, remain: item.$remain, paymentList: [{ date: site.getDate(), price: item.$price }] });
      delete item.$price;
      delete item.$month;
      delete item.$remain;
      item.$date = site.getDate();
      if ($scope.setting.autoPrint) {
        $scope.thermalPrint(item.paymentList[0], item.paymentList[0].paymentList[0]);
      }
    } else {
      $scope.error = "##word.Data must be correct completed##";
    }
  };
  $scope.addSubPayment = function (item) {
    if (item.$date && item.$price) {
      if (item.$price > item.remain) {
        $scope.error = "##word.The payment cannot be greater than the remaining amount##";
        return;
      }
      item.paymentList.unshift({ date: item.$date, price: item.$price });
      item.price += item.$price;
      item.remain = $scope.studentItem.requiredPayment - item.price;
      if ($scope.setting.autoPrint) {
        $scope.thermalPrint(item, item.paymentList[0]);
      }
      delete item.$price;
    } else {
      $scope.error = "##word.Data must be correct completed##";
    }
  };
  $scope.calcPayments = function (item) {
    $scope.error = "";
    $timeout(() => {
      item.paymentList = item.paymentList || [];
      item.price = 0;
      item.paymentList.forEach((_item) => {
        item.price += _item.price;
      });
      item.remain = $scope.studentItem.requiredPayment - item.price;
    }, 300);
  };
  $scope.calcRequiredPayment = function (item) {
    $scope.error = "";
    $timeout(() => {
      item.discountValue = ($scope.item.price * item.discount) / 100;
      item.requiredPayment = $scope.item.price - item.discountValue;
      $scope.calcRemain(item)
    }, 300);
  };
  $scope.exemptPayment = function (item, option) {
    if (option == true) {
      item.requiredPayment = 0;
      item.discount = 100;
    } else if (option == false) {
      item.requiredPayment = $scope.item.price;
      item.discount = 0;
    }
    item.exempt = option;
  };
  $scope.calcRemain = function (item) {
    $scope.error = "";
    $timeout(() => {
      if (item.$price > item.requiredPayment) {
        return;
      }
      item.$remain = item.requiredPayment - item.$price;
    }, 300);
  };

  $scope.exceptionRemain = function (item, option) {
    $scope.error = "";
    if (option == true) {
      item.remain = 0;
      item.exception = true;
    } else if (option == false) {
      item.remain = $scope.studentItem.requiredPayment - item.price;

      item.exception = false;
    }
  };

  $scope.searchAll = function () {
    $scope.error = "";
    $scope.getAll($scope.search);
    site.hideModal($scope.modalSearchID);
    $scope.search = {};
  };

  if ($scope.setting && $scope.setting.logo) {
    $scope.invoiceLogo = document.location.origin + $scope.setting.logo.url;
  }

  $scope.getAll();
  $scope.getSubjectsList();
  $scope.getWeekDaysList();
  $scope.getEducationalLevelsList();
  $scope.getGroupPaymentMethodList();
  $scope.getMonthList();
  $scope.getTeachersList();
});
