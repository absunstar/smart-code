app.controller("manageUsers", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.appName = "manageUsers";
  $scope.setting = site.showObject(`##data.#setting##`);

  $scope.modalID = "#manageUsersManageModal";
  $scope.modalSearchID = "#manageUsersSearchModal";
  $scope.mode = "add";
  $scope.structure = {
    image: {},
    active: true,
  };

  $scope.employee = {};
  $scope.item = {};
  $scope.list = [];

  $scope.showAdd = function (type) {
    $scope.error = "";
    $scope.mode = "add";
    $scope.item = { ...$scope.structure, type, $selectGroup: {} };
    site.showModal($scope.modalID);

    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.add = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/add`,
      data: _item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
          $scope.getAll();
        } else {
          $scope.error = response.data.error;
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
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.update = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
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
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.view = function (_item) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/user/view`,
      data: {
        id: _item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
          if ($scope.setting.isCenter && "##query.type##" == "student") {
            $scope.getStudentGroupsList();
            $scope.getGroupsList();
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

  $scope.showDelete = function (_item) {
    $scope.error = "";
    $scope.mode = "delete";
    $scope.item = {};
    $scope.view(_item);
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
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
          $scope.getAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.searchGetAll = function (ev, search) {
    $scope.error = "";
    if (ev && ev.which != 13) {
      return;
    }
    $scope.getAll({}, search);
  };

  
  $scope.getAll = function (where, search) {
    $scope.error = "";
    if ($scope.busyAll) {
      return;
    }
    $scope.busyAll = true;
    $scope.list = [];
    where = where || {};
    where["type"] = "##query.type##";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/all`,
      data: {
        where: where,
        search,
      },
    }).then(
      function (response) {
        $scope.busyAll = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal($scope.modalSearchID);
        }
      },
      function (err) {
        $scope.busyAll = false;
        $scope.error = err;
      }
    );
  };

  $scope.showSearch = function () {
    $scope.error = "";
    site.showModal($scope.modalSearchID);
  };

  $scope.searchAll = function () {
    $scope.error = "";
    $scope.getAll($scope.search);
    $scope.search = {};
  };

  $scope.addFiles = function () {
    $scope.error = "";
    $scope.item.filesList = $scope.item.filesList || [];
    $scope.item.filesList.push({
      file_date: site.getDate(),
      file_upload_date: site.getDate(),
      upload_by: "##user.firstName##",
    });
  };

  $scope.getNationalities = function ($search) {
    $scope.error = "";
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.nationalitiesList = [];
    $http({
      method: "POST",
      url: "/api/nationalities/all",
      data: {
        where: { active: true },
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
          $scope.nationalitiesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCountriesList = function ($search) {
    $scope.error = "";
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.countriesList = [];
    $http({
      method: "POST",
      url: "/api/countries/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
          callingCode: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.countriesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGovesList = function (country) {
    $scope.error = "";
    $scope.busy = true;
    $scope.govesList = [];

    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true,
          "country.id": country.id,
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
          $scope.govesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCitiesList = function (gov) {
    $scope.error = "";
    $scope.busy = true;
    $scope.citiesList = [];
    $http({
      method: "POST",
      url: "/api/cities/all",
      data: {
        where: {
          "gov.id": gov.id,
          active: true,
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
          $scope.citiesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAreasList = function (city) {
    $scope.error = "";
    $scope.busy = true;
    $scope.areasList = [];
    $http({
      method: "POST",
      url: "/api/areas/all",
      data: {
        where: {
          "city.id": city.id,
          active: true,
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
          $scope.areasList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCentersList = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/centers/all",
      data: {
        where: {
          active: true,
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
          $scope.centersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGenders = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.gendersList = [];
    $http({
      method: "POST",
      url: "/api/genders",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.gendersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getSchoolsList = function ($search) {
    $scope.error = "";
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.schoolsList = [];

    $http({
      method: "POST",
      url: "/api/schools/all",
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
          $scope.schoolsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getPurchaseTypeList = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.purchaseTypeList = [];
    $http({
      method: "POST",
      url: "/api/purchaseTypeList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.purchaseTypeList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getDepartmentsList = function ($search) {
    $scope.error = "";
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.departmentsList = [];

    $http({
      method: "POST",
      url: "/api/departments/all",
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
          $scope.departmentsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getEducationalLevelsList = function ($search) {
    $scope.error = "";
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
    $scope.error = "";
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
  $scope.getGroupsList = function ($search) {
    $scope.error = "";
    $scope.groupsList = [];
    if ($search && $search.length < 1) {
      return;
    }
    if (!$scope.item.educationalLevel || !$scope.item.educationalLevel.id || !$scope.item.schoolYear || !$scope.item.schoolYear.id) {
      $scope.error = "##word.Must Select Educational Level And School Year##";
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
          "educationalLevel.id": $scope.item.educationalLevel.id,
          "schoolYear.id": $scope.item.schoolYear.id,
        },
        select: { id: 1, name: 1, educationalLevel: 1, subject: 1, teacher: 1, schoolYear: 1, paymentMethod: 1, price: 1 },
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

  $scope.changeMainDiscount = function () {
    $scope.error = "";
    $timeout(() => {
      if ($scope.item.discount > 100 || $scope.item.discount < 0) {
        $scope.item.discount = 0;
        $scope.error = "##word.Error entering discount##";
        return;
      } else {
        $scope.item.$selectGroup = $scope.item.$selectGroup || {};
        $scope.item.$selectGroup.discount = $scope.item.discount;
      }
    }, 300);
  };
  $scope.saveStudentPayment = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/groups/saveStudentPayment`,
      data: {
        groupId: $scope.studentGroupItem.id,
        studentId: $scope.item.id,
        studentObject: $scope.studentItem,
      },
    }).then(function (response) {
      $scope.busy = false;
      if (response.data.done) {
        site.hideModal("#paymentsModal");
      }
    });
  };

  $scope.showPaidGroup = function (_item) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/groups/getStudentGroupPay`,
      data: {
        groupId: _item.group.id,
        studentId: $scope.item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.studentGroupItem = _item.group;
          $scope.studentGroupItem.$studentScreen = true;
          $scope.studentItem = response.data.doc;

          $scope.studentItem.$date = site.getDate();
          let index = $scope.monthList.findIndex((itm) => itm.code == $scope.studentItem.$date.getMonth());
          if (index !== -1) {
            $scope.studentItem.$month = $scope.monthList[index];
          }
          $scope.calcRequiredPayment($scope.studentItem);
          site.showModal("#paymentsModal");
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.calcRequiredPayment1 = function (item) {
    $scope.error = "";
    if (item.group && item.group.id) {
      $timeout(() => {
        if (item.discount > 100 || item.discount < 0) {
          $scope.error = "##word.Error entering discount##";
          return;
        }
        item.discountValue = (item.group.price * item.discount) / 100;
        item.requiredPayment = item.group.price - item.discountValue;
      }, 300);
    }
  };
  $scope.addGroup = function () {
    $scope.error = "";
    if (!$scope.item.$selectGroup || !$scope.item.$selectGroup.group || !$scope.item.$selectGroup.group.id) {
      $scope.error = "##word.Must Select Group##";
      return;
    }
    $scope.item.$studentGroupsList = $scope.item.$studentGroupsList || [];
    if (!$scope.item.$studentGroupsList.some((g) => g.group && g.group.id === $scope.item.$selectGroup.group.id)) {
      if (!$scope.item.id) {
        $scope.item.$studentGroupsList.unshift({ ...$scope.item.$selectGroup });
        $scope.item.$selectGroup = { discount: $scope.item.discount };
      } else {
        if ($scope.busyAddGroup) {
          return;
        }
        $scope.busyAddGroup = true;
        $http({
          method: "POST",
          url: "/api/groups/addStudentToGroup",
          data: {
            student: { id: $scope.item.id, firstName: $scope.item.firstName, barcode: $scope.item.barcode, mobile: $scope.item.mobile, parentMobile: $scope.item.parentMobile },
            groupId: $scope.item.$selectGroup.group.id,
            discount: $scope.item.$selectGroup.discount,
            discountValue: $scope.item.$selectGroup.discountValue,
            requiredPayment: $scope.item.$selectGroup.requiredPayment,
            exempt: $scope.item.$selectGroup.exempt,
          },
        }).then(
          function (response) {
            $scope.busyAddGroup = false;
            if (response.data.done) {
              $scope.item.$selectGroup = { discount: $scope.item.discount };
              $scope.getStudentGroupsList();
            }
          },
          function (err) {
            $scope.busyAddGroup = false;
            $scope.error = err;
          }
        );
      }
    } else {
      $scope.error = "##word.Group Is Exist##";
      return;
    }
  };

  $scope.getStudentGroupsList = function () {
    $scope.error = "";

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/groups/studentGroups",
      data: {
        active: true,
        "educationalLevel.id": $scope.item.educationalLevel.id,
        "schoolYear.id": $scope.item.schoolYear.id,
        "studentList.student.id": $scope.item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.item.$studentGroupsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.deleteStudentGroup = function (index, item) {
    if (!$scope.item.id) {
      $scope.item.$studentGroupsList.splice(index, 1);
    } else {
      if ($scope.busyDeleteGroup) {
        return;
      }
      $scope.busyDeleteGroup = true;
      $http({
        method: "POST",
        url: "/api/groups/deleteStudentFromGroup",
        data: {
          studentId: $scope.item.id,
          groupId: item.group.id,
        },
      }).then(
        function (response) {
          $scope.busyDeleteGroup = false;
          if (response.data.done) {
            $scope.getStudentGroupsList();
          }
        },
        function (err) {
          $scope.busyDeleteGroup = false;
          $scope.error = err;
        }
      );
    }
  };
  $scope.setPurchaseTypeDafault = function (index) {
    for (let i = 0; i < $scope.item.purchaseTypeList.length; i++) {
      $scope.item.purchaseTypeList[i].default = false;
    }
    $scope.item.purchaseTypeList[index].default = true;
  };
  $scope.addPurchaseTypeList = function () {
    $scope.item.purchaseTypeList = $scope.item.purchaseTypeList || [];
    if ($scope.item.$purchaseType && $scope.item.$purchaseType.name) {
      $scope.item.purchaseTypeList.unshift({
        ...$scope.item.$purchaseType,
        accountNumber: $scope.item.$accountNumber,
        accountName: $scope.item.$accountName,
      });
      $scope.item.$purchaseType = {};
      $scope.item.$accountNumber = "";
      $scope.item.$accountName = "";
    }
  };
  $scope.addLevelsList = function () {
    $scope.item.levelList = $scope.item.levelList || [];
    if ($scope.item.$educationalLevel && $scope.item.$educationalLevel.id && $scope.item.$schoolYear && $scope.item.$schoolYear.id && $scope.item.$subject && $scope.item.$subject.id) {
      $scope.item.levelList.unshift({
        educationalLevel: $scope.item.$educationalLevel,
        schoolYear: $scope.item.$schoolYear,
        subject: $scope.item.$subject,
      });
      $scope.item.$educationalLevel = {};
      $scope.item.$schoolYear = {};
      $scope.item.$subject = {};
    }
  };
  $scope.exemptPayment1 = function (item, option) {
    if (option == true) {
      item.discount = 100;
    } else if (option == false) {
      item.discount = 0;
    }
    item.exempt = option;
    $scope.calcRequiredPayment1(item);
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
        groupName: $scope.studentGroupItem.name,
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
          show: false,
          silent: true,
          pageSize: { width: 80 * 1000 },
          width: 300,
          selector: "#thermalPrint",
          ip: printer.ipDevice,
          port: printer.portDevice,
          printer: printer.ip.name.trim(),
          /* scaleFactor: 100, */
          dpi: { horizontal: 200, vertical: 50 },
          /* pageSize: "Letter", */
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
      item.discountValue = ($scope.studentGroupItem.price * item.discount) / 100;
      item.requiredPayment = $scope.studentGroupItem.price - item.discountValue;
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
  if ($scope.setting && $scope.setting.logo) {
    $scope.invoiceLogo = document.location.origin + $scope.setting.logo.url;
  }
  $scope.getAll();
  $scope.getNationalities();
  $scope.getCountriesList();
  $scope.getGenders();
  $scope.getCentersList();
  $scope.getEducationalLevelsList();
  if ($scope.setting.isCenter && "##query.type##" == "student") {
    $scope.getSchoolsList();
    $scope.getDepartmentsList();
  }
  $scope.getSubjectsList();
  $scope.getPurchaseTypeList();
  $scope.getEducationalLevelsList();
  $scope.getMonthList();
});
