app.controller("scans_requests", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.scans_requests = {};

  $scope.delivery_person_list = [
    {
      id: 1,
      name: "patient_himself",
      ar: "المريض نفسه",
      en: "The patient himself",
    },
    {
      id: 2,
      name: "another_person",
      ar: "شخص أخر",
      en: "Another Person",
    },
  ];

  $scope.displayAddScansRequests = function () {
    $scope._search = {};
    $scope.error = "";
    $scope.scans_requests = {
      image_url: "/images/scans_requests.png",
      date: new Date(),
      scans_list: [],
      paid: 0,
      active: true,
    };
    site.showModal("#scansRequestsAddModal");
  };

  $scope.addScansRequests = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#scansRequestsAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/scans_requests/add",
      data: $scope.scans_requests,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#scansRequestsAddModal");
          $scope.getScansRequestsList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like("*Must Enter Code*")) {
            $scope.error = "##word.must_enter_code##";
          } else if (
            response.data.error.like("*holding ticket for this patient*")
          ) {
            $scope.error = "##word.err_hold_ticket_patient##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateScansRequests = function (scans_requests) {
    $scope._search = {};

    $scope.error = "";
    $scope.detailsScansRequests(scans_requests);
    $scope.scans_requests = {};
    site.showModal("#scansRequestsUpdateModal");
  };

  $scope.updateScansRequests = function (scans_requests) {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#scansRequestsUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/scans_requests/update",
      data: scans_requests,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#scansRequestsUpdateModal");
          site.hideModal("#deliveryScansModal");
          site.hideModal("#puttingResultsScansModal");
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
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

  $scope.displayDetailsScansRequests = function (scans_requests) {
    $scope.error = "";
    $scope.detailsScansRequests(scans_requests);
    $scope.scans_requests = {};
    site.showModal("#scansRequestsDetailsModal");
  };

  $scope.detailsScansRequests = function (scans_requests) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/scans_requests/view",
      data: {
        id: scans_requests.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.scans_requests = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteScansRequests = function (scans_requests) {
    $scope.error = "";
    $scope.detailsScansRequests(scans_requests);
    $scope.scans_requests = {};
    site.showModal("#scansRequestsDeleteModal");
  };

  $scope.deleteScansRequests = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/scans_requests/delete",
      data: {
        id: $scope.scans_requests.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#scansRequestsDeleteModal");
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
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

  $scope.getScansRequestsList = function (where, type) {
    $scope.busy = true;
    if (!type) {
      $scope.list = [];
    }
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/scans_requests/all",
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          if (!type) {
            $scope.list = response.data.list;
            $scope.count = response.data.count;
          } else {
            $scope.scans_requests.last_scans_list = [];
            response.data.list.forEach((_scans) => {
              _scans.scans_list.forEach((_scans_list) => {
                _scans_list.date = _scans.date;
                $scope.scans_requests.last_scans_list.push(_scans_list);
              });
            });
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getScansRequestsList($scope.search);
    site.hideModal("#scansRequestsSearchModal");
    $scope.search = {};
  };

  $scope.getPatientList = function (ev) {
    $scope.busy = true;

    if (ev.which !== 13) {
      return;
    }

    $scope.customersList = [];
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        search: $scope.doctor_search,
        select: {},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.customersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.showPatient = function (id) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/view",
      data: {
        id: id,
        select: {},
      },
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {
          $scope.customer = response.data.doc;
          site.showModal("#customerDetailsModal");
          document.querySelector("#customerDetailsModal .tab-link").click();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displayAddCustomer = function () {
    $scope.error = "";
    $scope.customer = {
      image_url: "/images/customer.png",
      active: true,
      balance_creditor: 0,
      balance_debtor: 0,
      branch_list: [
        {
          charge: [{}],
        },
      ],
      currency_list: [],
      opening_balance: [{ initial_balance: 0 }],
      bank_list: [{}],
      dealing_company: [{}],
    };

    if (site.feature("medical")) {
      $scope.customer.image_url = "/images/patients.png";
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];
    } else if (site.feature("school") || site.feature("academy")) {
      $scope.customer.image_url = "/images/student.png";
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];
    }
    site.showModal("#customerAddModal");
    document.querySelector("#customerAddModal .tab-link").click();
  };

  $scope.addCustomer = function () {
    $scope.error = "";
    if ($scope.busy) {
      return;
    }

    const v = site.validated("#customerAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/add",
      data: $scope.customer,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#customerAddModal");
        } else {
          $scope.error = "Please Login First";
          if (response.data.error.like("*Must Enter Code*")) {
            $scope.error = "##word.must_enter_code##";
          } else if (
            response.data.error.like("*maximum number of adds exceeded*")
          ) {
            $scope.error = "##word.err_maximum_adds##";
          } else if (
            response.data.error.like("*ername must be typed correctly*")
          ) {
            $scope.error = "##word.err_username_contain##";
          } else if (response.data.error.like("*User Is Exist*")) {
            $scope.error = "##word.user_exists##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.loadDiscountTypes = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {
          code: 1,
          id: 1,
          name_ar: 1,
          name_en: 1,
          value: 1,
          type: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.discount_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadScans = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/scans/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          price: 1,
          delivery_time: 1,
          period: 1,
          immediate: 1,
          made_home_scan: 1,
          price_at_home: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.scansList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadDoctorsVisits = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.doctorsVisitsList = [];
    if ($scope.scans_requests.customer) {
      $http({
        method: "POST",
        url: "/api/doctors_visits/all",
        data: {
          select: {
            code: 1,
            id: 1,
            selected_clinic: 1,
            scans_list: 1,
          },
          where: {
            "customer.id": $scope.scans_requests.customer.id,
          },
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.doctorsVisitsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.addDiscount = function () {
    $scope.error = "";
    if (!$scope.discount.value) {
      $scope.error = "##word.error_discount##";
      return;
    } else {
      $scope.scans_requests.discountes = $scope.scans_requests.discountes || [];
      $scope.scans_requests.discountes.unshift({
        name_ar: $scope.discount.name_ar,
        name_en: $scope.discount.name_en,
        value: $scope.discount.value,
        type: $scope.discount.type,
      });
    }
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.scans_requests.discountes.splice(
      $scope.scans_requests.discountes.indexOf(_ds),
      1
    );
  };

  $scope.showDeliveryModal = function (scans_requests) {
    $scope.scans_requests = scans_requests;
    site.showModal("#deliveryScansModal");
  };

  $scope.showResultModal = function (scans_requests) {
    $scope.scans_requests = scans_requests;
    site.showModal("#puttingResultsScansModal");
  };

  $scope.setPersonDelivery = function () {
    $scope.scans_requests.scans_list.forEach((_scans) => {
      if (!_scans.person_delivery) {
        _scans.person_delivery = { ...$scope.scans_requests.$person_delivery };

        _scans.delivery_data = { ...$scope.scans_requests.$delivery_data };
      }
    });
  };

  $scope.showLastScans = function (scans_requests) {
    $scope._search = {};

    site.showModal("#lastScansModal");
  };

  $scope.showPersonDelivery = function (scan, type) {
    $scope.scan = scan;
    if (type === "view") {
      $scope.scan.$view = true;
    }

    site.showModal("#deliveryPersonModal");
  };

  $scope.getDoctorVisitScans = function (doctor_visit) {
    doctor_visit.scans_list = doctor_visit.scans_list || [];

    let scansList = [];

    $scope.scansList.forEach((_an) => {
      let found = doctor_visit.scans_list.some(
        (_a) => _a.scan && _a.scan.id === _an.id
      );

      if (found) {
        scansList.unshift(_an);
      }
    });

    scansList.forEach((_a_l) => {
      $timeout(() => {
        $scope.changeScansList(_a_l);
      }, 250);
    });
  };

  $scope.changeScansList = function (scans) {
    let obj = {
      id: scans.id,
      name_ar: scans.name_ar,
      name_en: scans.name_en,
      code: scans.code,
      immediate: scans.immediate,
      delivery_time: scans.delivery_time,
      price: scans.price,
      period: scans.period,
      made_home_scan: scans.made_home_scan,
      price_at_home: scans.price_at_home,
      result: 0,
    };

    let found_scans = $scope.scans_requests.scans_list.some(
      (_scans) => _scans.id === scans.id
    );

    if (!found_scans) {
      $scope.scans_requests.scans_list.unshift(obj);
      $scope.calc($scope.scans_requests);
    }
    $scope._scan = "";
  };

  $scope.calc = function (obj) {
    $scope.error = "";
    $timeout(() => {
      obj.total_discount = 0;
      obj.total_value = 0;

      if (obj.scans_list && obj.scans_list.length > 0) {
        obj.scans_list.forEach((_a) => {
          if (obj.at_home) {
            if (_a.made_home_scan) {
              obj.total_value += _a.price_at_home || 0;
            }
          } else {
            obj.total_value += _a.price;
          }
        });
      }

      if (obj.discountes && obj.discountes.length > 0)
        obj.discountes.forEach((ds) => {
          if (ds.type == "percent")
            obj.total_discount +=
              (obj.total_value * site.toNumber(ds.value)) / 100;
          else obj.total_discount += site.toNumber(ds.value);
        });

      obj.net_value = obj.total_value - obj.total_discount;
      obj.remain = obj.net_value - (obj.paid || 0);
      $scope.discount = {
        type: "number",
      };
    }, 250);
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          "gov.id": gov.id,
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          "city.id": city.id,
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getDatesDays = function (day) {
    $scope.busy = true;
    $scope.datesDaysList = [];
    if (day) {
      $http({
        method: "POST",
        url: "/api/dates/day",
        data: {
          day: day,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.datesDaysList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };
  $scope.getDaysList = function () {
    $http({
      method: "POST",
      url: "/api/days/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.daysList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.bookVisitDay = function (date, index) {
    /*   $scope.datesDaysList.forEach((_d, i) => {
      if (i == index) {
        _d.$select = true;
      } else {
        _d.$select = false;
      }
    }); */
    $scope.selectDate = index;
    $scope.scans_requests.visit_date = date;
  };

  $scope.bookVisitAddress = function (address, index) {
    if (
      $scope.scans_requests.customer &&
      $scope.scans_requests.customer.address_list
    ) {
      $scope.scans_requests.customer.address_list.forEach((_d, i) => {
        if (i == index) {
          _d.$select = true;
        } else {
          _d.$select = false;
        }
      });
    }
    $scope.scans_requests.visit_address = address;
  };

  $scope.getNumberingAuto = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "scans_requests",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getScansRequestsList();
  $scope.loadScans();
  $scope.getGovList();
  $scope.getDaysList();
  $scope.loadDiscountTypes();
  $scope.getNumberingAuto();
});
