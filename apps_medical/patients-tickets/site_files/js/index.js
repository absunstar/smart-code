app.controller("patients_tickets", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.patients_tickets = {};

  $scope.displayAddPatientsTickets = function () {
    $scope.error = '';
    $scope.patients_tickets = {
      image_url: '/images/patients_tickets.png',
      active: true,
      opening_date: new Date()

    };
    site.showModal('#patientsTicketsAddModal');

  };

  $scope.addPatientsTickets = function () {
    $scope.error = '';
    const v = site.validated('#patientsTicketsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/patients_tickets/add",
      data: $scope.patients_tickets
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#patientsTicketsAddModal');
          $scope.getPatientsTicketsList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*an unclosed ticket for the same*')) {
            $scope.error = "##word.err_unclosing_ticket_patient##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdatePatientsTickets = function (patients_tickets) {
    $scope.error = '';
    $scope.detailsPatientsTickets(patients_tickets);
    $scope.patients_tickets = {};
    site.showModal('#patientsTicketsUpdateModal');
  };

  $scope.updatePatientsTickets = function (patients_tickets, status) {
    $scope.error = '';
    if (!status) {

      const v = site.validated('#patientsTicketsUpdateModal');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }

    } else if (status === 'close') {


      patients_tickets.status = {
        id: 3,
        ar: 'مغلقة',
        en: 'closing',
      }

    } else if (status === 'hold') {
      patients_tickets.status = {
        id: 2,
        ar: 'معلقة',
        en: 'holding',
      }

    } else if (status === 'open') {
      patients_tickets.status = {
        id: 1,
        ar: 'مفتوحة',
        en: 'Opening',
      }
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/patients_tickets/update",
      data: patients_tickets
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          $scope.getPatientsTicketsList();
          if (!status) {
            site.hideModal('#patientsTicketsUpdateModal');
          }
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsPatientsTickets = function (patients_tickets) {
    $scope.error = '';
    $scope.detailsPatientsTickets(patients_tickets);
    $scope.patients_tickets = {};
    site.showModal('#patientsTicketsViewModal');

  };

  $scope.detailsPatientsTickets = function (patients_tickets) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/patients_tickets/view",
      data: {
        id: patients_tickets.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.patients_tickets = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeletePatientsTickets = function (patientsTickets) {
    $scope.error = '';
    $scope.detailsPatientsTickets(patientsTickets);
    $scope.patients_tickets = {};
    site.showModal('#patientsTicketsDeleteModal');
  };

  $scope.deletePatientsTickets = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/patients_tickets/delete",
      data: {
        id: $scope.patients_tickets.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#patientsTicketsDeleteModal');
          $scope.getPatientsTicketsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
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
          $scope.count = $scope.list.length;
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

  $scope.getPatientsTicketsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/patients_tickets/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#patientsTicketsSearchModal');
          $scope.search = {};
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
        screen: "patients_tickets"
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#patientsTicketsSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getPatientsTicketsList($scope.search);
    site.hideModal('#patientsTicketsSearchModal');
    $scope.search = {};

  };

  $scope.getPatientsTicketsList();
  $scope.getNumberingAuto();

});