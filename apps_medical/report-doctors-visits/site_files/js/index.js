app.controller("report_doctors_visits", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_doctors_visits = {};


  $scope.getReportInvoicesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/doctors_visits/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.doctor_visit_price = 0;
          $scope.urgent_visit = 0;
          $scope.total_discount = 0;
          $scope.total_value = 0;

          $scope.list.forEach(_l => {
            $scope.doctor_visit_price += _l.doctor_visit_price || 0;
            $scope.urgent_visit += _l.urgent_visit.value || 0;
            $scope.total_discount += _l.total_discount || 0;
            $scope.total_value += _l.net_value || 0;
            
          });

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDefaultSettings = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.getStatus = function () {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/status/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.statusList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displayDetailsDoctorsVisits = function (doctors_visits) {
    $scope.error = '';
    $scope.detailsDoctorsVisits(doctors_visits);
    $scope.doctors_visits = {};
    site.showModal('#doctorsVisitsViewModal');
    document.querySelector('#doctorsVisitsViewModal .tab-link').click();

  };

  $scope.detailsDoctorsVisits = function (doctors_visits) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/doctors_visits/view",
      data: {
        id: doctors_visits.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.doctors_visits = response.data.doc;
          $scope.clinicList = [$scope.doctors_visits.selected_clinic];

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.getSpecialtyList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_specialties/all",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.specialtyList = response.data.list;
          $scope.specialtyList.unshift({
            id: 0,
            name: 'كل التخصصات'
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getClinicList = function (where) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/clinics/all",
      data: {
        where: where,
        /*  select: {
           id: 1,
           name: 1,
           doctor_list: 1,
           specialty: 1
         } */
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.clinicList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDoctorList = function (ev) {

    $scope.error = '';

    $scope.busy = true;
    if (ev.which !== 13) {
      return;
    }

    $scope.doctorList = [];
    $http({
      method: "POST",
      url: "/api/doctors/all",
      data: {
        search: $scope.doctor_search,
        select: {

        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.doctorList = response.data.list;
          $scope.doctor_search = '';

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

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
        search: $scope.patient_search,
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

  $scope.searchAll = function () {
    $scope._search = {};
    if ($scope.search) $scope.customer = $scope.search.customer;
    else $scope.customer = {};
    $scope.getReportInvoicesList($scope.search);

    $scope.search = {};
    site.hideModal('#reportDoctorsVisitsSearchModal');
  };


  $scope.getDefaultSettings();
  $scope.getSpecialtyList();
  $scope.getClinicList();
  $scope.getStatus();

});