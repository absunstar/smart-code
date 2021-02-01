app.controller("tickets", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.ticket = {};

  $scope.displayAddTicket = function () {
    $scope.error = '';
    $scope.ticket = {};
    $scope.patient_search = '';
    $scope.doctor_search = '';
    $scope.clinic_search = {};
    $scope.address = false;
    $scope.spicialty = false;
    $scope.doctor = false;

    $scope.ticket = {
      image_url: '/images/ticket.png',
      active: true,
      date: new Date(),
      status: $scope.statusList[0],
      medicines_list: [{
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


    if ($scope.defaultSettings.general_Settings) {
      if ($scope.defaultSettings.general_Settings.specialty) {
        $scope.ticket.specialty = $scope.specialtyList.find(_specialty => { return _specialty.id === $scope.defaultSettings.general_Settings.specialty.id });
      }

      if ($scope.defaultSettings.general_Settings.clinic)
        $scope.ticket.clinic = $scope.clinicList.find(_clinic => { return _clinic.id === $scope.defaultSettings.general_Settings.clinic.id });

      if ($scope.defaultSettings.general_Settings.ticket_type)
        $scope.ticket.ticket_type = $scope.defaultSettings.general_Settings.ticket_type;

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
    $scope.clinic.vacation_list = $scope.clinic.vacation_list || [];
    let found_vacation = $scope.clinic.vacation_list.some(_vacation => new Date($scope.ticket.date) == new Date(_vacation.date));
  
    if(found_vacation){
      $scope.error = '##word.cannot_booked_holiday_clinic##';
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
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDynamicTicket = function () {
    $scope.error = '';
    $scope.ticket = {};
    $scope.patient_search = '';
    $scope.doctor_search = '';
    $scope.clinic_search = {};
    $scope.address = false;
    $scope.spicialty = false;
    $scope.doctor = false;

    $scope.dynamic_ticket = {
      image_url: '/images/ticket.png',
      active: true,
      status: $scope.statusList[4],
      medicines_list: [{
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
    /*   $scope.ticket = {
        status: $scope.statusList[0],
  
      }; */
    site.showModal('#ticketUpdateModal');
    document.querySelector('#ticketUpdateModal .tab-link').click();
  };

  $scope.updateTicket = function () {
    $scope.error = '';
    const v = site.validated('#ticketUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.ticket.status.id === 5) {

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


  $scope.getClinicList = function (where) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/clinics/all",
      data: {
        where: where,
        /*  select: {
           id: 1,
           hospital: 1,
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

  $scope.getClinicBookList = function (ticket) {
    $scope.busy = true;


    $http({
      method: "POST",
      url: "/api/clinics/all",
      data: {
        where: {
          specialty: ticket.specialty,
          clinic: ticket.clinic,
          doctor: ticket.doctor,
          active: true
        },
        /*  select: {
           id: 1,
           hospital: 1,
           name: 1,
           doctor_list: 1,
           specialty: 1
         } */
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.clinicBookList = response.data.list;
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

  $scope.getMedicinesList = function (where) {
    $scope.busy = true;
    $scope.medicinesList = [];
    $http({
      method: "POST",
      url: "/api/medicine/all",
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
          $scope.medicinesList = response.data.list;
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
    document.querySelector('#customerAddModal .tab-link').click();

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


  $scope.getPatientList = function (ev) {
    $scope.busy = true;

    if (ev.which !== 13) {
      return;
    }

    $scope.patientList = [];
    $http({
      method: "POST",
      url: "/api/customers/all",
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

  $scope.getCustomerGroupList = function () {
    $http({
      method: "POST",
      url: "/api/customers_group/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.customerGroupList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.Gender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: "POST",
      url: "/api/gender/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getBloodType = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.bloodTypeList = [];
    $http({
      method: "POST",
      url: "/api/blood_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.bloodTypeList = response.data;
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
          site.showModal('#customerDetailsModal')
          document.querySelector('#customerDetailsModal .tab-link').click();

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

  $scope.changeTicketPrice = function () {
    if ($scope.ticket.ticket_type && $scope.ticket.ticket_type.id) {

      if ($scope.ticket.ticket_type.id === 1) {
        if ($scope.ticket.doctor_price && $scope.ticket.doctor_price.detection)
          $scope.ticket.ticket_price = $scope.ticket.doctor_price.detection;
        else if ($scope.ticket.clinic_price && $scope.ticket.clinic_price.detection)
          $scope.ticket.ticket_price = $scope.ticket.clinic_price.detection;

      } else if ($scope.ticket.ticket_type.id === 2) {
        if ($scope.ticket.doctor_price && $scope.ticket.doctor_price.re_detection)
          $scope.ticket.ticket_price = $scope.ticket.doctor_price.re_detection;
        else if ($scope.ticket.clinic_price && $scope.ticket.clinic_price.re_detection)
          $scope.ticket.ticket_price = $scope.ticket.clinic_price.re_detection;

      } else if ($scope.ticket.ticket_type.id === 3) {
        if ($scope.ticket.doctor_price && $scope.ticket.doctor_price.consultation)
          $scope.ticket.ticket_price = $scope.ticket.doctor_price.consultation;
        else if ($scope.ticket.clinic_price && $scope.ticket.clinic_price.consultation)
          $scope.ticket.ticket_price = $scope.ticket.clinic_price.consultation;
      }

    }
  };

  $scope.showTimes = function (d, c) {
    $scope.ticket.clinic_price = c.detection_price;
    $scope.ticket.doctor_price = d.detection_price;
    $scope.clinic = c;

    $scope.ticket.selected_clinic = {
      id: c.id,
      name: c.name
    };

    $scope.ticket.selected_specialty = {
      id: c.specialty.id,
      name: c.specialty.name
    };
    $scope.ticket.selected_doctor = d.doctor;
    $scope.ticket.selected_shift = {};

    if ($scope.ticket.ticket_type && $scope.ticket.ticket_type.id) {

      if ($scope.ticket.ticket_type.id == 1) {
        if ($scope.ticket.doctor_price && $scope.ticket.doctor_price.detection)
          $scope.ticket.ticket_price = $scope.ticket.doctor_price.detection;
        else if ($scope.ticket.clinic_price && $scope.ticket.clinic_price.detection)
          $scope.ticket.ticket_price = $scope.ticket.clinic_price.detection;

      } else if ($scope.ticket.ticket_type.id == 2) {
        if ($scope.ticket.doctor_price && $scope.ticket.doctor_price.re_detection)
          $scope.ticket.ticket_price = $scope.ticket.doctor_price.re_detection;
        else if ($scope.ticket.clinic_price && $scope.ticket.clinic_price.re_detection)
          $scope.ticket.ticket_price = $scope.ticket.clinic_price.re_detection;

      } else if ($scope.ticket.ticket_type.id == 3) {
        if ($scope.ticket.doctor_price && $scope.ticket.doctor_price.consultation)
          $scope.ticket.ticket_price = $scope.ticket.doctor_price.consultation;
        else if ($scope.ticket.clinic_price && $scope.ticket.clinic_price.consultation)
          $scope.ticket.ticket_price = $scope.ticket.clinic_price.consultation;
      }

    }


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
    $scope.dynamic_ticket = $scope.dynamic_ticket || {};
    let where = {
      active: true,
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

    clinic.$doctor_list.forEach(d => {
      $scope.dynamic_ticket.$doctor_list.push({
        id: d.doctor.id,
        name: d.doctor.name,
        detection_Duration: d.detection_Duration,
        specialty: d.doctor.specialty,
        $shift_list: [d.shift]
      });
    });
  };

  $scope.getTicketTypeList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/ticket_type/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.ticketTypeList = response.data;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDiagnosisList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/diagnosis/all",
      data: {}
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


  $scope.getDiseaseList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/disease/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.diseaseList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getMedicineList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medicine/all",
      data: { where: { active: true } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.medicineList = response.data.list;
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "tickets_book"
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

  $scope.getTicketList();
  $scope.getSpecialtyList();
  $scope.getMedicinesList();
  $scope.getScansList();
  $scope.getAnalysesList();
  $scope.getOperationList();
  $scope.getStatus();
  $scope.getDiseaseList();
  $scope.getMedicineList();
  $scope.getGovList();
  $scope.getCustomerGroupList();
  $scope.Gender();
  $scope.getBloodType();
  $scope.getClinicList();
  $scope.getTicketTypeList();
  $scope.getDiagnosisList();
  $scope.getClinicTicketList();
  $scope.getDefaultSettings();
  $scope.getNumberingAuto();
});