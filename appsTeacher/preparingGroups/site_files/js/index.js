app.controller("preparingGroups", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.setting = site.showObject(`##data.#setting##`);
  $scope.appName = "preparingGroups";
  $scope.modalID = "#preparingGroupsManageModal";
  $scope.modalSearchID = "#preparingGroupsSearchModal";
  $scope.mode = "add";
  $scope._search = {};
  $scope.structure = {
    image: { url: "/theme1/images/setting/preparingGroups.png" },
    active: true,
  };
  $scope.item = {};
  $scope.list = [];

  $scope.showAdd = function (_item) {
    $scope.error = "";
    $scope.mode = "add";
    $scope.item = { ...$scope.structure, studentList: [] };
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
      data: _item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
          let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
          if (index !== -1) {
            $scope.list[index] = response.data.result.doc;
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

  /*   $scope.getTeachersList = function ($search) {
    $scope.error = "";
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
        select: { id: 1, firstName: 1, prefix: 1 },
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
  }; */

  $scope.getGroupsList = function ($search) {
    $scope.error = "";
    $scope.groupsList = [];
    if ($search && $search.length < 1) {
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/groups/all",
      data: {
        search: $search,
        where: {
          active: true,
        },
        select: { id: 1, name: 1, educationalLevel: 1, schoolYear: 1, subject: 1, teacher: 1, paymentMethod: 1, price: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.groupsList = response.data.list;
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

  $scope.handleToPreparingGroup = function (id) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/groups/handleToPreparingGroup",
      data: { id: id, type: "validDay", date: new Date() },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.item.studentList = response.data.doc.studentList;
          $scope.item.date = response.data.doc.validDay.date;
          $scope.item.day = response.data.doc.validDay.day;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAll = function (where) {
    $scope.error = "";
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
  $scope.getStudentPaid = function () {
    if ($scope.item.group.paymentMethod && $scope.item.group.paymentMethod.name == "lecture") {
      $scope.item.paidCount = $scope.item.studentList.filter((s) => s.paidType == "donePaid").length;
      $scope.item.notPaidCount = $scope.item.studentList.filter((s) => s.paidType == "notPaid").length;
    }
  };
  $scope.setAttendance = function (item, type) {
    $scope.error = "";
    if (type == "attend") {
      item.attendDate = new Date();
      item.attend = true;
    } else if (type == "absence") {
      item.attend = false;
      delete item.attendDate;
      delete item.departureDate;
    } else if (type == "departure") {
      item.departureDate = new Date();
    }
  };

  $scope.selectGroup = function () {
    $scope.error = "";
    $scope.item.subject = { ...$scope.item.group.subject };
    $scope.item.teacher = { ...$scope.item.group.teacher };
    $scope.item.educationalLevel = { ...$scope.item.group.educationalLevel };
    $scope.item.schoolYear = { ...$scope.item.group.schoolYear };
    delete $scope.item.group.subject;
    delete $scope.item.group.teacher;
    delete $scope.item.group.educationalLevel;
    delete $scope.item.group.schoolYear;
  };

  $scope.showSearch = function () {
    $scope.error = "";
    site.showModal($scope.modalSearchID);
  };

  $scope.numberAbsencesAttendance = function () {
    $scope.error = "";

    $scope.item.attendanceCount = $scope.item.studentList.filter((s) => s.attend).length;
    $scope.item.absenceCount = $scope.item.studentList.filter((s) => !s.attend).length;
    $scope.$applyAsync();
  };

  $scope.attendStudent = function (search, ev) {
    $scope.error = "";
    if (ev.which == 13 && search) {
      if ($scope.busyAttend) {
        return;
      }
      $scope.busyAttend = true;
      let index = $scope.item.studentList.findIndex((itm) => itm.student.barcode == search);
      if (index !== -1) {
        if (!$scope.item.studentList[index].attend) {
          $scope.item.studentList[index].attendDate = new Date();
          $scope.item.studentList[index].attend = true;
          $scope.numberAbsencesAttendance();
        }
        $scope.busyAttend = false;
      } else {
        $http({
          method: "POST",
          url: "/api/manageUsers/toDifferentGroup",
          data: {
            where: {
              type: "student",
              barcode: search,
              "educationalLevel.id": $scope.item.educationalLevel.id,
              "schoolYear.id": $scope.item.schoolYear.id,
              active: true,
            },
            subjectId: $scope.item.subject.id,
          },
        }).then(
          function (response) {
            $scope.busyAttend = false;
            if (response.data.done && response.data.doc) {
              if (!$scope.item.studentList.some((k) => k.student && k.student.id === response.data.doc.student.id)) {
                let stu = {
                  student: response.data.doc.student,
                  group: response.data.doc.group,
                  discount: response.data.doc.discount,
                  discountValue: response.data.doc.discountValue,
                  requiredPayment: response.data.doc.requiredPayment,
                  exempt: response.data.doc.exempt,
                  attend: true,
                  attendDate: new Date(),
                  new: true,
                };
                if ($scope.item.group.paymentMethod && $scope.item.group.paymentMethod.name == "lecture") {
                  stu.paidType = "notPaid";
                }
                $scope.item.studentList.unshift(stu);
                $scope.numberAbsencesAttendance();
                $scope.getStudentPaid();
              } else {
                $scope.error = "##word.Student Exist##";
              }
            } else {
              $scope.error = response.data.error || "##word.Not Found##";
            }
            $scope.$search = "";
          },
          function (err) {
            $scope.busyAttend = false;
            $scope.error = err;
          }
        );
      }
    }
  };

  if ($scope.setting && $scope.setting.logo) {
    $scope.invoiceLogo = document.location.origin + $scope.setting.logo.url;
  }

  $scope.thermalPrint = function (obj) {
    $scope.error = "";
    if ($scope.busy) return;
    $scope.busy = true;
    if ($scope.setting.thermalPrinter) {
      $("#thermalPrint").removeClass("hidden");
      $scope.thermal = {
        printDate: new Date(),
        date: $scope.item.date,
        groupName: $scope.item.group.name,
        student: obj.student,
        price: obj.requiredPayment,
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
  $scope.studentPaid = function (item, type) {
    $scope.error = "";
    if (type == "donePaid") {
      item.price = $scope.item.group.price;
      item.paidType = type;
      if ($scope.setting.autoPrint) {
        $scope.thermalPrint(item);
      }
    } else if (type == "notPaid") {
      item.price = 0;
      item.paidType = type;
    }
  };
  $scope.searchAll = function () {
    $scope.error = "";
    $scope.getAll($scope.search);
    site.hideModal($scope.modalSearchID);
    $scope.search = {};
  };

  $scope.getAll();
  $scope.getGroupsList();
  /* $scope.getTeachersList(); */
});
