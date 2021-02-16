app.controller("operations_requests", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.operations_requests = {};

  $scope.delivery_person_list = [
    {
      id: 1,
      name: 'patient_himself',
      ar: 'المريض نفسه',
      en: 'The patient himself',
    },
    {
      id: 2,
      name: 'another_person',
      ar: 'شخص أخر',
      en: 'Another Person',
    }
  ];

  $scope.displayAddOperationsRequests = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.operations_requests = {
      image_url: '/images/operations_requests.png',
      date: new Date(),
      operations_list: [],
      active: true
    };
    site.showModal('#operationsRequestsAddModal');
  };

  $scope.addOperationsRequests = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#operationsRequestsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/operations_requests/add",
      data: $scope.operations_requests
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#operationsRequestsAddModal');
          $scope.getOperationsRequestsList();
        } else {
          $scope.error = 'Please Login First';
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"

          } else if (response.data.error.like('*holding ticket for this patient*')) {
            $scope.error = "##word.err_hold_ticket_patient##"

          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateOperationsRequests = function (operations_requests) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsOperationsRequests(operations_requests);
    $scope.operations_requests = {};
    site.showModal('#operationsRequestsUpdateModal');
  };

  $scope.updateOperationsRequests = function (operations_requests) {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#operationsRequestsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/operations_requests/update",
      data: operations_requests
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#operationsRequestsUpdateModal');
          site.hideModal('#deliveryOperationsModal');
          site.hideModal('#puttingResultsOperationsModal');
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
    )
  };

  $scope.displayDetailsOperationsRequests = function (operations_requests) {
    $scope.error = '';
    $scope.detailsOperationsRequests(operations_requests);
    $scope.operations_requests = {};
    site.showModal('#operationsRequestsDetailsModal');
  };

  $scope.detailsOperationsRequests = function (operations_requests) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/operations_requests/view",
      data: {
        id: operations_requests.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.operations_requests = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteOperationsRequests = function (operations_requests) {
    $scope.error = '';
    $scope.detailsOperationsRequests(operations_requests);
    $scope.operations_requests = {};
    site.showModal('#operationsRequestsDeleteModal');
  };

  $scope.deleteOperationsRequests = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/operations_requests/delete",
      data: {
        id: $scope.operations_requests.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#operationsRequestsDeleteModal');
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
    )
  };

  $scope.getOperationsRequestsList = function (where, type) {
    $scope.busy = true;
    if (!type) {
      $scope.list = [];
    }
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/operations_requests/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          if (!type) {
            $scope.list = response.data.list;
            $scope.count = response.data.count;
          } else {
            $scope.operations_requests.last_operations_list = [];
            response.data.list.forEach(_operations => {
              _operations.operations_list.forEach(_operations_list => {
                _operations_list.date = _operations.date;
                $scope.operations_requests.last_operations_list.push(_operations_list);
              })
            });
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getOperationsRequestsList($scope.search);
    site.hideModal('#operationsRequestsSearchModal');
    $scope.search = {}

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
        select: {

        }
      }
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
    )
  };

  $scope.showPatient = function (id) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/view",
      data: {
        id: id,
        select: {}
      }
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {
          $scope.customer = response.data.doc;
          site.showModal('#customerDetailsModal');
          document.querySelector('#customerDetailsModal .tab-link').click();

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.displayAddCustomer = function () {
    $scope.error = '';
    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,
      allergic_food_list: [{}],
      allergic_drink_list: [{}],
      medicine_list: [{}],
      disease_list: [{}],
    };
    site.showModal('#customerAddModal');

  };

  $scope.addCustomer = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#customerAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/add",
      data: $scope.customer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerAddModal');
        } else {
          $scope.error = 'Please Login First';
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.loadDiscountTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {
          code: 1,
          id: 1,
          name: 1,
          value: 1,
          type: 1
        }
      }
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
    )
  };

  $scope.loadOperations = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/operation/all",
      data: {
        id: 1,
        name: 1,
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.operationsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadPricesCodes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/prices_codes/all",
      data: {
        id: 1,
        name: 1,
        price: 1,
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.pricesCodesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadDoctorsVisits = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.doctorsVisitsList = [];
    if ($scope.operations_requests.customer) {

      $http({
        method: "POST",
        url: "/api/doctors_visits/all",
        data: {
          select: {
            code: 1,
            id: 1,
            selected_clinic: 1,
            operations_list: 1
          },
          where: {
            'customer.id': $scope.operations_requests.customer.id
          }
        }
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
      )
    }
  };


  $scope.addDiscount = function () {
    $scope.error = '';
    if (!$scope.discount.value) {
      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.operations_requests.discountes = $scope.operations_requests.discountes || [];
      $scope.operations_requests.discountes.unshift({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
    };
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.operations_requests.discountes.splice($scope.operations_requests.discountes.indexOf(_ds), 1);
  };

  $scope.showModalList = function (operations_requests, type) {
    $scope.operations_requests = operations_requests;
    if (type === 'delivery') {
      site.showModal('#deliveryOperationsModal');

    } else if (type === 'result') {

      site.showModal('#puttingResultsOperationsModal');
    }

  };

  $scope.setPersonDelivery = function () {

    $scope.operations_requests.operations_list.forEach(_operations => {

      if (!_operations.person_delivery) {
        _operations.person_delivery = Object.assign({}, $scope.operations_requests.$person_delivery);
        _operations.delivery_data = Object.assign({}, $scope.operations_requests.$delivery_data);
      };

    });
  };



  $scope.showPersonDelivery = function (operations_requests, type) {

    $scope.delivery_person = Object.assign({}, operations_requests);
    if (type === 'view') {
      $scope.delivery_person.$view = true;
    }

    site.showModal('#deliveryPersonModal');

  };





  $scope.getDoctorVisitOperations = function (doctor_visit) {

    doctor_visit.operations_list = doctor_visit.operations_list || [];

    let operationsList = [];

    $scope.operationsList.forEach(_an => {
      let found = doctor_visit.operations_list.some(_a => _a.operations && _a.operations.id === _an.id);

      if (found) {
        operationsList.unshift(_an)
      }
    });

    operationsList.forEach(_a_l => {
      $timeout(() => {
        $scope.changeOperationsList(_a_l);
      }, 250);
    });
  };


  $scope.changeOperationsList = function (operations) {

    let obj = {
      id: operations.id,
      name: operations.name,
      code: operations.code,
      immediate: operations.immediate,
      delivery_time: operations.delivery_time,
      price: operations.price,
      period: operations.period,
      result: 0,
    };

    let found_operations = $scope.operations_requests.operations_list.some(_operations => _operations.id === operations.id);

    if (!found_operations) {
      $scope.operations_requests.operations_list.unshift(obj);
      $scope.calc($scope.operations_requests);
    };

  };

  $scope.calc = function (obj) {
    $scope.error = '';
    $timeout(() => {
      obj.total_discount = 0;
      obj.total_value = 0;

      if (obj.operations_list && obj.operations_list.length > 0) {
        obj.operations_list.forEach(_a => {
          obj.total_value += _a.price_code.price;
        });
      }

      if (obj.discountes && obj.discountes.length > 0)
        obj.discountes.forEach(ds => {
          if (ds.type == 'percent')
            obj.total_discount += obj.total_value * site.toNumber(ds.value) / 100;
          else obj.total_discount += site.toNumber(ds.value);
        });

      obj.net_value = obj.total_value - obj.total_discount;
      obj.remain = obj.net_value - (obj.paid || 0);
      $scope.discount = {
        type: 'number'
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
          active: true
        },
        select: { id: 1, name: 1, code: 1 }
      }
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
    )
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select: { id: 1, name: 1, code: 1 }
      }
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
    )
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          'city.id': city.id,
          active: true
        },
      }
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
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "operations_requests"
      }
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
    )
  };


  $scope.getOperationsRequestsList();
  $scope.loadOperations();
  $scope.loadPricesCodes();
  $scope.getGovList();
  $scope.loadDiscountTypes();
  $scope.getNumberingAuto();
});