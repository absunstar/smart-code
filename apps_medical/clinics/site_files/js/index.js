app.controller("clinics", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.clinic = {};


  $scope.displayAddClinic = function () {
    $scope.error = '';
    $scope.clinic = {
      image_url: '/images/clinic.png',
      active: true,
      detection_price : {
        detection: 0,
        re_detection: 0,
        consultation: 0,
      },
      shift_list: [{
        name: '##word.basic##',
        times_list: [{}]
      }],
      doctor_list: [{}],
      nurse_list: [{}],
      vacation_list: [{}]
    };
    site.showModal('#clinicAddModal');
    document.querySelector('#clinicAddModal  .tab-link').click();
  };

  $scope.addClinic = function () {
    $scope.error = '';
    const v = site.validated('#clinicAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/clinics/add",
      data: $scope.clinic
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#clinicAddModal');
          $scope.getClinicList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateClinic = function (clinic) {
    $scope.error = '';
    $scope.detailsClinic(clinic);
    $scope.getNursesList(clinic);
    $scope.getDoctorList(clinic);
    $scope.clinic = {};
    site.showModal('#clinicUpdateModal');
    document.querySelector('#clinicUpdateModal .tab-link').click();

  };

  $scope.updateClinic = function () {
    $scope.error = '';
    const v = site.validated('#clinicUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/clinics/update",
      data: $scope.clinic
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#clinicUpdateModal');
          $scope.getClinicList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsClinic = function (clinic) {
    $scope.error = '';
    $scope.detailsClinic(clinic);
    $scope.clinic = {};
    site.showModal('#clinicDetailsModal');
    document.querySelector('#clinicDetailsModal .tab-link').click();
  };

  $scope.detailsClinic = function (clinic) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/clinics/view",
      data: {
        id: clinic.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.clinic = response.data.doc;
          $scope.getDoctorList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteClinic = function (clinic) {
    $scope.error = '';
    $scope.detailsClinic(clinic);
    $scope.clinic = {};
    site.showModal('#clinicDeleteModal');
    document.querySelector('#clinicDeleteModal .tab-link').click();

  };

  $scope.deleteClinic = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/clinics/delete",
      data: {
        id: $scope.clinic.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#clinicDeleteModal');
          $scope.getClinicList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getClinicList = function (where) {
    $scope.busy = true;
    $scope.list = [];
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
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  /*  $scope.getHospitalList = function (where) {
     $scope.busy = true;
     $scope.hospitalList = [];
     $http({
       method: "POST",
       url: "/api/hospitals/all",
       data: {
         where: {
           active: true
         },    
       }
     }).then(
       function (response) {
         $scope.busy = false;
         if (response.data.done && response.data.list.length > 0) {
           $scope.hospitalList = response.data.list;
         }
       },
       function (err) {
         $scope.busy = false;
         $scope.error = err;
       }
     )
   }; */

  $scope.getSpecialList = function () {
    $scope.busy = true;
    $scope.specialList = [];
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
          $scope.specialList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.getNursesList = function (clinic) {
    if ( !clinic.specialty) {
      return;
    }

    $scope.error = '';

    $scope.busy = true;
    $scope.nurseList = [];
    $http({
      method: "POST",
      url: "/api/nursing/all",
      data: {
        where: {
          'specialty.id': clinic.specialty.id
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.nurseList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDoctorList = function (clinic) {

    if (!clinic.specialty) {
      return;
    }

    $scope.error = '';

    $scope.busy = true;
    $scope.doctorList = [];
    $http({
      method: "POST",
      url: "/api/doctors/all",
      data: {
        where: {
          'specialty.id': clinic.specialty.id
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.doctorList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.getDayList = function () {
    $http({
      method: "POST",
      url: "/api/days/all"
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.dayList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.displayAddWorkTime = function () {
    $scope.error = '';
    $scope.clinic = {
      doctor_list: [],
      nurse_list: [],
      work_times_list: [{
        vacation: false,
        day: $scope.dayList[0]
      }, {
        day: $scope.dayList[1]
      }, {
        day: $scope.dayList[2]
      }, {
        day: $scope.dayList[3]
      }, {
        day: $scope.dayList[4]
      }, {
        day: $scope.dayList[5]
      }, {
        vacation: true,
        day: $scope.dayList[6]

      }]
    };

    site.showModal('#workTimeModal');

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "clinics"
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
    site.showModal('#clinicSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getClinicList($scope.search);
    site.hideModal('#clinicSearchModal');
    $scope.search = {};
  };

  /*   $scope.getHospitalList();
  */
  $scope.getClinicList();
  $scope.getSpecialList();
  $scope.getDayList();
  $scope.getNumberingAuto();

});