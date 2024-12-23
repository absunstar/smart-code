app.controller("analysis_requests", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.analysis_requests = {};

  $scope.delivery_person_list = [
    {
      id: 1,
      name: "patient_himself",
      Ar: "المريض نفسه",
      En: "The patient himself",
    },
    {
      id: 2,
      name: "another_person",
      Ar: "شخص أخر",
      En: "Another Person",
    },
  ];

  $scope.displayAddAnalysisRequests = function () {
    $scope._search = {};
    $scope.error = "";
    $scope.analysis_requests = {
      image_url: "/images/analysis_requests.png",
      date: new Date(),
      analysis_list: [],
      paid: 0,
      active: true,
    };
    site.showModal("#analysisRequestsAddModal");
  };

  $scope.addAnalysisRequests = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#analysisRequestsAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/analysis_requests/add",
      data: $scope.analysis_requests,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#analysisRequestsAddModal");
          $scope.getAnalysisRequestsList();
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

  $scope.displayUpdateAnalysisRequests = function (analysis_requests) {
    $scope._search = {};

    $scope.error = "";
    $scope.detailsAnalysisRequests(analysis_requests);
    $scope.analysis_requests = {};
    site.showModal("#analysisRequestsUpdateModal");
  };

  $scope.showLastAnalysis = function (analysis_requests) {
    $scope._search = {};

    site.showModal("#lastAnalysisModal");
  };

  $scope.updateAnalysisRequests = function (analysis_requests) {
    $scope.error = "";

    if ($scope.busy) {
      return;
    }

    const v = site.validated("#analysisRequestsUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analysis_requests/update",
      data: analysis_requests,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          site.hideModal("#analysisRequestsUpdateModal");
          site.hideModal("#deliveryAnalysisModal");
          site.hideModal("#puttingResultsAnalysisModal");
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like("*holding ticket for this patient*")) {
            $scope.error = "##word.err_hold_ticket_patient##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsAnalysisRequests = function (analysis_requests) {
    $scope.error = "";
    $scope.detailsAnalysisRequests(analysis_requests);
    $scope.analysis_requests = {};
    site.showModal("#analysisRequestsDetailsModal");
  };

  $scope.detailsAnalysisRequests = function (analysis_requests) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analysis_requests/view",
      data: {
        id: analysis_requests.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.analysis_requests = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteAnalysisRequests = function (analysis_requests) {
    $scope.error = "";
    $scope.detailsAnalysisRequests(analysis_requests);
    $scope.analysis_requests = {};
    site.showModal("#analysisRequestsDeleteModal");
  };

  $scope.deleteAnalysisRequests = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analysis_requests/delete",
      data: {
        id: $scope.analysis_requests.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#analysisRequestsDeleteModal");
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

  $scope.getAnalysisRequestsList = function (where, type) {
    $scope.busy = true;
    if (!type) {
      $scope.list = [];
    }
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/analysis_requests/all",
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
            $scope.analysis_requests.last_analysis_list = [];
            response.data.list.forEach((_analysis) => {
              _analysis.analysis_list.forEach((_analysis_list) => {
                _analysis_list.date = _analysis.date;
                $scope.analysis_requests.last_analysis_list.push(
                  _analysis_list
                );
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
    $scope.getAnalysisRequestsList($scope.search);
    site.hideModal("#analysisRequestsSearchModal");
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
  $scope.addCustomerFiles = function () {
    $scope.error = "";
    $scope.customer.files_list = $scope.customer.files_list || [];
    $scope.customer.files_list.push({
      file_date: new Date(),
      file_upload_date: new Date(),
      upload_by: "##user.name##",
    });
  };
  $scope.displayAddCustomer = function () {
    $scope.error = "";
    $scope.customer = {
      image_url: "/images/customer.png",
      active: true,
      address_list: [{}],
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
      $scope.error = v.messages[0].Ar;
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
          name_Ar: 1,
          name_En: 1,
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

  $scope.loadAnalysis = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analysis/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_Ar: 1,
          name_En: 1,
          price: 1,
          delivery_time: 1,
          period: 1,
          immediate: 1,
          male: 1,
          female: 1,
          child: 1,
          made_home_analysis: 1,
          price_at_home: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.analysisList = response.data.list;
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
    if ($scope.analysis_requests.customer) {
      $http({
        method: "POST",
        url: "/api/doctors_visits/all",
        data: {
          select: {
            code: 1,
            id: 1,
            selected_clinic: 1,
            analysis_list: 1,
          },
          where: {
            "customer.id": $scope.analysis_requests.customer.id,
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
      $scope.analysis_requests.discountes =
        $scope.analysis_requests.discountes || [];
      $scope.analysis_requests.discountes.unshift({
        name_Ar: $scope.discount.name_Ar,
        name_En: $scope.discount.name_En,
        value: $scope.discount.value,
        type: $scope.discount.type,
      });
    }
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.analysis_requests.discountes.splice(
      $scope.analysis_requests.discountes.indexOf(_ds),
      1
    );
  };

  $scope.showDeliveryModal = function (analysis_requests) {
    $scope.analysis_requests = analysis_requests;
    site.showModal("#deliveryAnalysisModal");
  };

  $scope.showResultModal = function (analysis_requests) {
    $scope.analysis_requests = analysis_requests;
    site.showModal("#puttingResultsAnalysisModal");
  };

  $scope.setPersonDelivery = function () {
    $scope.analysis_requests.analysis_list.forEach((_analysis) => {
      if (!_analysis.person_delivery) {
        _analysis.person_delivery = {
          ...$scope.analysis_requests.$person_delivery,
        };
        if ($scope.analysis) {
          _analysis.delivery_data = {
            ...$scope.analysis.delivery_data,
          };
        }
      }
    });
  };

  $scope.showPersonDelivery = function (analysis, type) {
    $scope.analysis = analysis;
    if (type === "view") {
      $scope.analysis.$view = true;
    }

    site.showModal("#deliveryPersonModal");
  };

  $scope.getDoctorVisitAnalysis = function (doctor_visit) {
    doctor_visit.analysis_list = doctor_visit.analysis_list || [];

    let analysisList = [];

    $scope.analysisList.forEach((_an) => {
      let found = doctor_visit.analysis_list.some(
        (_a) => _a.analysis && _a.analysis.id === _an.id
      );

      if (found) {
        analysisList.unshift(_an);
      }
    });

    analysisList.forEach((_a_l) => {
      $timeout(() => {
        $scope.changeAnalysisList(_a_l);
      }, 250);
    });
  };

  $scope.changeAnalysisList = function (analys) {
    let obj = {
      id: analys.id,
      name_Ar: analys.name_Ar,
      name_En: analys.name_En,
      code: analys.code,
      immediate: analys.immediate,
      delivery_time: analys.delivery_time,
      price: analys.price,
      period: analys.period,
      made_home_analysis: analys.made_home_analysis,
      price_at_home: analys.price_at_home,
      result: 0,
    };

    if (
      $scope.analysis_requests.customer &&
      $scope.analysis_requests.customer.id
    ) {
      if ($scope.analysis_requests.customer.child && analys.child) {
        obj.from = analys.child.from;
        obj.to = analys.child.to;
      } else if (
        $scope.analysis_requests.customer.gender &&
        $scope.analysis_requests.customer.gender.name == "female" &&
        analys.female
      ) {
        obj.from = analys.female.from;
        obj.to = analys.female.to;
      } else {
        obj.from = analys.male.from;
        obj.to = analys.male.to;
      }
    }

    let found_analysis = $scope.analysis_requests.analysis_list.some(
      (_analysis) => _analysis.id === analys.id
    );

    if (!found_analysis) {
      $scope.analysis_requests.analysis_list.unshift(obj);
      $scope.calc($scope.analysis_requests);
    }
    $scope.analys = "";
  };

  $scope.calc = function (obj) {
    $scope.error = "";
    $timeout(() => {
      obj.total_discount = 0;
      obj.total_value = 0;

      if (obj.analysis_list && obj.analysis_list.length > 0) {
        obj.analysis_list.forEach((_a) => {
          if (obj.at_home) {
            if (_a.made_home_analysis) {
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
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 },
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
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 },
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
    $scope.analysis_requests.visit_date = date;
  };

  $scope.bookVisitAddress = function (address, index) {
    if (
      $scope.analysis_requests.customer &&
      $scope.analysis_requests.customer.address_list
    ) {
      $scope.analysis_requests.customer.address_list.forEach((_d, i) => {
        if (i == index) {
          _d.$select = true;
        } else {
          _d.$select = false;
        }
      });
    }
    $scope.analysis_requests.visit_address = address;
  };

  $scope.getNumberingAuto = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "analysis_requests",
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

  $scope.getAnalysisRequestsList();
  $scope.loadAnalysis();
  $scope.getGovList();
  $scope.getDaysList();
  $scope.loadDiscountTypes();
  $scope.getNumberingAuto();
});
