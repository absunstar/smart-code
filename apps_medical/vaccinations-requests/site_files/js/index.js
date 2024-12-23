app.controller("vaccinations_requests", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.vaccinations_requests = {};

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

  $scope.displayAddVaccinationsRequests = function () {
    $scope._search = {};
    $scope.error = "";
    $scope.vaccinations_requests = {
      image_url: "/images/vaccinations_requests.png",
      date: new Date(),
      vaccinations_list: [],
      paid: 0,
      active: true,
    };
    site.showModal("#vaccinationsRequestsAddModal");
  };

  $scope.addVaccinationsRequests = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#vaccinationsRequestsAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/vaccinations_requests/add",
      data: $scope.vaccinations_requests,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#vaccinationsRequestsAddModal");
          $scope.getVaccinationsRequestsList();
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

  $scope.displayUpdateVaccinationsRequests = function (vaccinations_requests) {
    $scope._search = {};

    $scope.error = "";
    $scope.detailsVaccinationsRequests(vaccinations_requests);
    $scope.vaccinations_requests = {};
    site.showModal("#vaccinationsRequestsUpdateModal");
  };

  $scope.updateVaccinationsRequests = function (vaccinations_requests) {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#vaccinationsRequestsUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vaccinations_requests/update",
      data: vaccinations_requests,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#vaccinationsRequestsUpdateModal");
          site.hideModal("#deliveryVaccinationsModal");
          site.hideModal("#puttingResultsVaccinationsModal");
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

  $scope.displayDetailsVaccinationsRequests = function (vaccinations_requests) {
    $scope.error = "";
    $scope.detailsVaccinationsRequests(vaccinations_requests);
    $scope.vaccinations_requests = {};
    site.showModal("#vaccinationsRequestsDetailsModal");
  };

  $scope.detailsVaccinationsRequests = function (vaccinations_requests) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vaccinations_requests/view",
      data: {
        id: vaccinations_requests.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.vaccinations_requests = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteVaccinationsRequests = function (vaccinations_requests) {
    $scope.error = "";
    $scope.detailsVaccinationsRequests(vaccinations_requests);
    $scope.vaccinations_requests = {};
    site.showModal("#vaccinationsRequestsDeleteModal");
  };

  $scope.deleteVaccinationsRequests = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vaccinations_requests/delete",
      data: {
        id: $scope.vaccinations_requests.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#vaccinationsRequestsDeleteModal");
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

  $scope.getVaccinationsRequestsList = function (where, type) {
    $scope.busy = true;
    if (!type) {
      $scope.list = [];
    }
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/vaccinations_requests/all",
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
            $scope.vaccinations_requests.last_vaccinations_list = [];
            response.data.list.forEach((_vaccinations) => {
              _vaccinations.vaccinations_list.forEach((_vaccinations_list) => {
                _vaccinations_list.date = _vaccinations.date;
                $scope.vaccinations_requests.last_vaccinations_list.push(
                  _vaccinations_list
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
    $scope.getVaccinationsRequestsList($scope.search);
    site.hideModal("#vaccinationsRequestsSearchModal");
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

  $scope.loadVaccinations = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vaccinations/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_Ar: 1,
          name_En: 1,
          price: 1,
          made_home_vaccination: 1,
          price_at_home: 1,
          from_age: 1,
          to_age: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.vaccinationsList = response.data.list;
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
    if ($scope.vaccinations_requests.customer) {
      $http({
        method: "POST",
        url: "/api/doctors_visits/all",
        data: {
          select: {
            code: 1,
            id: 1,
            selected_clinic: 1,
            vaccinations_list: 1,
          },
          where: {
            "customer.id": $scope.vaccinations_requests.customer.id,
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
      $scope.vaccinations_requests.discountes =
        $scope.vaccinations_requests.discountes || [];
      $scope.vaccinations_requests.discountes.unshift({
        name_Ar: $scope.discount.name_Ar,
        name_En: $scope.discount.name_En,
        value: $scope.discount.value,
        type: $scope.discount.type,
      });
    }
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.vaccinations_requests.discountes.splice(
      $scope.vaccinations_requests.discountes.indexOf(_ds),
      1
    );
  };

  $scope.showDeliveryModal = function (vaccinations_requests) {
    $scope.vaccinations_requests = vaccinations_requests;
    site.showModal("#deliveryVaccinationsModal");
  };

  $scope.showResultModal = function (vaccinations_requests) {
    $scope.vaccinations_requests = vaccinations_requests;
    site.showModal("#puttingResultsVaccinationsModal");
  };

  $scope.setPersonDelivery = function () {
    $scope.vaccinations_requests.vaccinations_list.forEach((_vaccinations) => {
      if (!_vaccinations.person_delivery) {
        _vaccinations.person_delivery = {
          ...$scope.vaccinations_requests.$person_delivery,
        };

        _vaccinations.delivery_data = {
          ...$scope.vaccinations_requests.$delivery_data,
        };
      }
    });
  };

  $scope.showLastVaccinations = function (vaccinations_requests) {
    $scope._search = {};

    site.showModal("#lastVaccinationsModal");
  };

  $scope.showPersonDelivery = function (vaccination, type) {
    $scope.vaccination = vaccination;
    if (type === "view") {
      $scope.vaccination.$view = true;
    }

    site.showModal("#deliveryPersonModal");
  };

  $scope.getDoctorVisitVaccinations = function (doctor_visit) {
    doctor_visit.vaccinations_list = doctor_visit.vaccinations_list || [];

    let vaccinationsList = [];

    $scope.vaccinationsList.forEach((_an) => {
      let found = doctor_visit.vaccinations_list.some(
        (_a) => _a.vaccination && _a.vaccination.id === _an.id
      );

      if (found) {
        vaccinationsList.unshift(_an);
      }
    });

    vaccinationsList.forEach((_a_l) => {
      $timeout(() => {
        $scope.changeVaccinationsList(_a_l);
      }, 250);
    });
  };

  $scope.changeVaccinationsList = function (vaccinations) {
    let obj = {
      id: vaccinations.id,
      name_Ar: vaccinations.name_Ar,
      name_En: vaccinations.name_En,
      code: vaccinations.code,
      immediate: vaccinations.immediate,
      delivery_time: vaccinations.delivery_time,
      price: vaccinations.price,
      period: vaccinations.period,
      made_home_vaccination: vaccinations.made_home_vaccination,
      price_at_home: vaccinations.price_at_home,
      from_age: vaccinations.from_age,
      to_age: vaccinations.to_age,
      result: 0,
    };

    let found_vaccinations =
      $scope.vaccinations_requests.vaccinations_list.some(
        (_vaccinations) => _vaccinations.id === vaccinations.id
      );

    if (!found_vaccinations) {
      $scope.vaccinations_requests.vaccinations_list.unshift(obj);
      $scope.calc($scope.vaccinations_requests);
    }
    $scope._vaccination = "";
  };

  $scope.calc = function (obj) {
    $scope.error = "";
    $timeout(() => {
      obj.total_discount = 0;
      obj.total_value = 0;

      if (obj.vaccinations_list && obj.vaccinations_list.length > 0) {
        obj.vaccinations_list.forEach((_a) => {
          if (obj.at_home) {
            if (_a.made_home_vaccination) {
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
    $scope.vaccinations_requests.visit_date = date;
  };

  $scope.bookVisitAddress = function (address, index) {
    if (
      $scope.vaccinations_requests.customer &&
      $scope.vaccinations_requests.customer.address_list
    ) {
      $scope.vaccinations_requests.customer.address_list.forEach((_d, i) => {
        if (i == index) {
          _d.$select = true;
        } else {
          _d.$select = false;
        }
      });
    }
    $scope.vaccinations_requests.visit_address = address;
  };

  $scope.getNumberingAuto = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "vaccinations_requests",
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

  $scope.getVaccinationsRequestsList();
  $scope.loadVaccinations();
  $scope.getGovList();
  $scope.getDaysList();
  $scope.loadDiscountTypes();
  $scope.getNumberingAuto();
});
