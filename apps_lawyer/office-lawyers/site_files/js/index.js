app.controller("office_lawyers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.office_lawyers = {};

  $scope.displayAddOfficeLawyers = function () {
    $scope.error = '';
    $scope.office_lawyers = {
      image_url: '/images/office_lawyers.png',
      lawyer : true,
      active: true
    };

    site.showModal('#officeLawyersAddModal');
    document.querySelector('#officeLawyersAddModal .tab-link').click();
  };

  $scope.addOfficeLawyers = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#officeLawyersAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/office_lawyers/add",
      data: $scope.office_lawyers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#officeLawyersAddModal');
          $scope.list.push(response.data.doc);
          $scope.count = $scope.list.length;
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateOfficeLawyers = function (oppenent) {
    $scope.error = '';
    $scope.detailsOfficeLawyers(oppenent);
    $scope.office_lawyers = {};
    $scope.showOpeningBalance = false;
    site.showModal('#officeLawyersUpdateModal');
    document.querySelector('#officeLawyersUpdateModal .tab-link').click();
  };

  $scope.displaybankingAndAccounting = function (event) {

    site.showTabContent(event, '#bankingAndAccounting');

    let num = 0;
    let ln = $scope.office_lawyers.opening_balance;

    for (let i = 0; i < ln.length; i++) {
      if (ln[i].initial_balance > 0) {

        if (ln[i].balance_type == "credit") {
          num = num - parseInt(ln[i].initial_balance);
        } else {
          num = num + parseInt(ln[i].initial_balance);
        }
      }
    }
    if ($scope.showOpeningBalance)
      $scope.office_lawyers.balance = parseInt(num);

  };



  $scope.updateOfficeLawyers = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#officeLawyersUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/office_lawyers/update",
      data: $scope.office_lawyers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#officeLawyersUpdateModal');
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

  $scope.displayDeleteOfficeLawyers = function (oppenent) {
    $scope.error = '';
    $scope.detailsOfficeLawyers(oppenent);
    $scope.office_lawyers = {};
    site.showModal('#officeLawyersDeleteModal');
    document.querySelector('#officeLawyersDeleteModal .tab-link').click();
  };

  $scope.deleteOfficeLawyers = function () {
    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/office_lawyers/delete",
      data: {
        id: $scope.office_lawyers.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#officeLawyersDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count = $scope.list.length;
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

  $scope.displayDetailsOfficeLawyers = function (oppenent) {
    $scope.error = '';
    $scope.detailsOfficeLawyers(oppenent);
    $scope.office_lawyers = {};
    site.showModal('#officeLawyersDetailsModal');
    document.querySelector('#officeLawyersDetailsModal .tab-link').click();
  };

  $scope.detailsOfficeLawyers = function (oppenent) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/office_lawyers/view",
      data: {
        id: oppenent.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.office_lawyers = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displaySendEmail = function () {
    $scope.error = '';
    site.showModal('#officeLawyersSendEmailModal');
  };

  $scope.getOfficeLawyersList = function (where) {
    $scope.error = '';
 
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/office_lawyers/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
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
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 }
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
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 }
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

  $scope.getGender = function () {
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

  $scope.loadMaritalsStatus = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/maritals_status/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.maritals_status = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadMilitariesStatus = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/militaries_status/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.militaries_status = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getJobsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/jobs/all",
      data: {
        select: {
          id: 1, active: 1, trainer: 1, name_ar: 1, name_en: 1, code: 1
        },
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.jobsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getDegree = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_degrees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.degreeList = response.data.list;
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

  $scope.getNationalitiesList = function () {
    $http({
      method: "POST",
      url: "/api/nationalities/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.nationalitiesList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };


  $scope.searchAll = function () {

    $scope.getOfficeLawyersList(where);

    site.hideModal('#officeLawyersSearchModal');
    $scope.search = {}

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "office_lawyers"
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

  $scope.getNumberingAuto();
  $scope.getOfficeLawyersList();
  $scope.getGovList();
  $scope.getGender();
  $scope.getNationalitiesList();
  $scope.loadMaritalsStatus();
  $scope.loadMilitariesStatus();
  $scope.getJobsList();
  $scope.getDegree();
});