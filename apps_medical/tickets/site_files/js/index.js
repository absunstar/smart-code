app.controller("tickets", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.ticket = {};

  $scope.displayAddTicket = function () {
    $scope.error = '';
    $scope.ticket = [];
    $scope.patient_search = [];
    $scope.doctor_search = [];
    $scope.clinic_search = [];
    $scope.hospital = false;
    $scope.address = false;
    $scope.spicialty = false;
    $scope.doctor = false;
    $scope.clinic = false;
    $scope.clinicList = {};

    $scope.ticket = {
      image_url: '/images/ticket.png',
      active: true,
      date: new Date(),
      status: $scope.statusList[0],
      drugs_list: [{
        active: true
      }],
      scans_list: [{
        active: true
      }],
      analyses_list: [{
        active: true
      }],
      operation_list: [{
        active: true
      }],

    };
    site.showModal('#ticketAddModal');

  };

  $scope.addTicket = function () {
    $scope.error = '';
    const v = site.validated('#ticketAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tickets/add",
      data: $scope.ticket
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#ticketAddModal');
          $scope.getTicketList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDynamicTicket = function () {
    $scope.error = '';
    $scope.ticket = [];
    $scope.patient_search = [];
    $scope.doctor_search = [];
    $scope.clinic_search = [];
    $scope.hospital = false;
    $scope.address = false;
    $scope.spicialty = false;
    $scope.doctor = false;
    $scope.clinic = false;
    $scope.clinicList = {};

    $scope.dynamic_ticket = {
      image_url: '/images/ticket.png',
      active: true,
      status: $scope.statusList[4],
      drugs_list: [{
        active: true
      }],
      scans_list: [{
        active: true
      }],
      analyses_list: [{
        active: true
      }],
      operation_list: [{
        active: true
      }],

    };
    site.showModal('#dynamicTicketModal');

  };

  $scope.GenerateTickets = function () {
    $scope.error = '';
    const v = site.validated('#dynamicTicketModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/tickets/generate_tickets",
      data: {
        hospital: {
          id: $scope.dynamic_ticket.hospital.id,
          name: $scope.dynamic_ticket.hospital.name
        },
        clinic: {
          id: $scope.dynamic_ticket.clinic.id,
          name: $scope.dynamic_ticket.clinic.name
        },
        doctor: {
          detection_Duration: $scope.dynamic_ticket.doctor.detection_Duration,
          id: $scope.dynamic_ticket.doctor.id,
          name: $scope.dynamic_ticket.doctor.name,
          specialty: $scope.dynamic_ticket.doctor.specialty
        },
        shift: $scope.dynamic_ticket.shift,
        period_ticket: $scope.dynamic_ticket.period_ticket
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#dynamicTicketModal');
          $scope.getTicketList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateTicket = function (ticket) {
    $scope.error = '';
    $scope.detailsTicket(ticket);
    $scope.ticket = {
      status: $scope.statusList[0],

    };
    site.showModal('#ticketUpdateModal');
  };

  $scope.updateTicket = function () {
    $scope.error = '';
    const v = site.validated('#ticketUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.ticket.status.id == 5) {

      $scope.ticket.status = $scope.statusList[0];
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tickets/update",
      data: $scope.ticket
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#ticketUpdateModal');
          site.hideModal('#ticketViewModal');
          $scope.getTicketList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.updateView = function () {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tickets/update",
      data: $scope.ticket
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#ticketViewModal');
          site.hideModal('#ticketNotes');
          $scope.getTicketList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.updateStatus = function () {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tickets/update",
      data: $scope.ticket
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) { } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsTicket = function (ticket) {
    $scope.error = '';
    $scope.detailsTicket(ticket);
    $scope.ticket = {};
    site.showModal('#ticketViewModal');
    document.querySelector('#ticketViewModal .tab-link').click();

  };

  $scope.detailsTicket = function (ticket) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/tickets/view",
      data: {
        id: ticket.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.ticket = response.data.doc;
          $scope.clinicList = [$scope.ticket.selected_clinic];

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteTicket = function (ticket) {
    $scope.error = '';
    $scope.detailsTicket(ticket);
    $scope.ticket = {};
    site.showModal('#ticketDeleteModal');
    document.querySelector('#ticketDeleteModal .tab-link').click();

  };

  $scope.deleteTicket = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/tickets/delete",
      data: {
        id: $scope.ticket.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#ticketDeleteModal');
          site.hideModal('#ticketViewModal');
          $scope.getTicketList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getTicketList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/tickets/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#ticketSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
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

  $scope.getHospitalList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hospitals/all",
      data: {
        where: {
          active: true,
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done && response.data.list.length > 0) {
          $scope.hospitalList = response.data.list;
          $scope.hospitalList.unshift({
            id: 0,
            name: 'كل المستشفيات'
          });
        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getClinicList = function (where, ) {
    $scope.busy = true;

    $scope.clinicList = [];
    where = where || {};
    where.active = true;

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/clinics/all",
      data: {
        where: where,
        select: {
          id: 1,
          hospital: 1,
          name: 1,
          doctor_list: 1,
          specialty: 1
        }
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
          console.log($scope.doctorList.id);
          

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.getSearchDoctorList = function () {

    $scope.error = '';

    $scope.busy = true;

    $scope.doctorList_s = [];
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
          $scope.doctorList_s = response.data.list;
          

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };


  $scope.getDrugsList = function (where) {
    $scope.busy = true;
    $scope.drugsList = [];
    $http({
      method: "POST",
      url: "/api/drugs/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.drugsList = response.data.list;
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

    $scope.patientList = [];
    $http({
      method: "POST",
      url: "/api/patients/all",
      data: {
        search: $scope.patient_search,
        select: {

        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.patientList = response.data.list;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getScansList = function () {
    $scope.busy = true;
    $scope.scansList = [];
    $http({
      method: "POST",
      url: "/api/scans/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.scansList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAnalysesList = function () {
    $scope.busy = true;
    $scope.analysesList = [];
    $http({
      method: "POST",
      url: "/api/analyses/all",
      data: {

        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.analysesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getOperationList = function () {
    $scope.busy = true;
    $scope.operationList = [];
    $http({
      method: "POST",
      url: "/api/operation/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.operationList = response.data.list;
        }
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

  $scope.getDiagnosis = function () {
    $scope.busy = true;
    $scope.diagnosisList = [];
    $http({
      method: "POST",
      url: "/api/diagnosis/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.diagnosisList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
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
        select: {
          id: 1,
          name: 1
        }
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

  $scope.getCityList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/cities/all",
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
          $scope.cityList = response.data.list;
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
      url: "/api/patients/view",
      data: {
        id: id,
        select: {}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.patient = response.data.doc;
          site.showModal('#patientViewModal')
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  }

  $scope.showDoctors = function (clinic) {
    $scope.ticket.selected_clinic = clinic;
    site.showModal('#ticketsSelectDoctor');
  };

  $scope.showTimes = function (d, c) {
    $scope.ticket.selected_clinic = {
      id: c.id,
      name: c.name
    };
    $scope.ticket.selected_hospital = {
      id: c.hospital.id,
      name: c.hospital.name
    };
    $scope.ticket.selected_specialty = {
      id: c.specialty.id,
      name: c.specialty.name
    };
    $scope.ticket.selected_doctor = d.doctor;
    $scope.ticket.selected_shift = [];

    $http({
      method: "POST",
      url: "/api/clinics/shifts/all",
      data: {
        shift_name: d.shift.name,
        'clinic.id': c.id
      }
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {
          $scope.ticket.selected_shift = response.data.shift;
          site.showModal('#ticketsSelectTimes');
        }

      })

  };

  $scope.booking = function (time) {
    $scope.ticket.selected_time = time;

    site.hideModal('#ticketsSelectTimes');

  };


  $scope.bookingSlot = function (time_slot) {
    $scope.ticket_add.selected_time_slot = time_slot;
  };

  $scope.attend = function (ticket) {
    if (ticket.status && ticket.status.id && ticket.status.id == 1) {
      ticket.status = $scope.statusList[1];
      $scope.ticket = ticket;
      $scope.updateStatus();
    }
  };

  $scope.without = function (ticket) {
    if (ticket.status && ticket.status.id && ticket.status.id != 1) {
      ticket.status = $scope.statusList[0];
      $scope.ticket = ticket;
      $scope.updateStatus();
    }
  };

  $scope.enter = function (ticket) {
    if (ticket.status.id == 2) {
      ticket.status = $scope.statusList[2];
      $scope.ticket = ticket;
      $scope.updateStatus();
      site.hideModal('#ticketNotes');
    }
  };

  $scope.sellorder = function (ticket) {
    if (ticket.status && ticket.status.id && ticket.status.id != 2) {
      ticket.status = $scope.statusList[1];
      $scope.ticket = ticket;
      $scope.updateStatus();
    }
  };

  $scope.detection = function (ticket) {
    if (ticket.status && ticket.status.id && ticket.status.id == 3) {
      ticket.status = $scope.statusList[3];
      $scope.ticket = ticket;
      $scope.updateStatus();
      site.showModal('#ticketViewModal');
      document.querySelector('#ticketViewModal .tab-link').click();
    }
  };

  $scope.atTheDoctor = function (ticket) {
    if (ticket.status && ticket.status.id && ticket.status.id != 3) {
      ticket.status = $scope.statusList[2];
      $scope.ticket = ticket;
      $scope.updateStatus();
    }
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#ticketSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getTicketList($scope.search);
    site.hideModal('#ticketSearchModal');

    $scope.search = {};
  };

  $scope.getClinicTicketList = function (hospital) {
    $scope.busy = true;
    $scope.clinicTicketList = [];
    let where = {
      active: true,
    }
    if (hospital) {
      where['hospital.id'] = hospital.id
    }
    $http({
      method: "POST",
      url: "/api/clinics/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done && response.data.list.length > 0) {
          $scope.clinicTicketList = response.data.list;
          if (hospital) {

            $scope.dynamic_ticket.$clinic_list = [];
            $scope.dynamic_ticket.$doctor_list = [];

            response.data.list.forEach(clinc => {

              $scope.dynamic_ticket.$clinic_list.push({
                id: clinc.id,
                name: clinc.name,
                $doctor_list: clinc.doctor_list
              });

              clinc.doctor_list.forEach(d => {

                $scope.dynamic_ticket.$doctor_list.push({
                  id: d.doctor.id,
                  name: d.doctor.name,
                  detection_Duration: d.detection_Duration,
                  $shift_list: [d.shift]
                });
              });
            });
          }
        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getClincDoctorList = function (clinic) {
    $scope.dynamic_ticket.$doctor_list = [];
    console.log(clinic.$doctor_list);
    
    clinic.$doctor_list.forEach(d => {
      $scope.dynamic_ticket.$doctor_list.push({
        id: d.doctor.id,
        name: d.doctor.name,
        detection_Duration: d.detection_Duration,
        specialty : d.doctor.specialty,
        $shift_list: [d.shift]
      });
    });
  };

  $scope.getTicketList();
  $scope.getSpecialtyList();
  $scope.getDrugsList();
  $scope.getScansList();
  $scope.getAnalysesList();
  $scope.getOperationList();
  $scope.getStatus();
  $scope.getDiagnosis();
  $scope.getGovList();
  $scope.getHospitalList();
  $scope.getClinicTicketList();
  $scope.getSearchDoctorList();
});