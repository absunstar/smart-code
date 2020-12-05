app.controller("oppenents_lawyers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.oppenents_lawyers = {};

  $scope.displayAddOppenentsLawyers = function () {
    $scope.error = '';
    $scope.oppenents_lawyers = {
      image_url: '/images/oppenents_lawyers.png',
      active: true
    };

    site.showModal('#oppenentsLawyersAddModal');
    document.querySelector('#oppenentsLawyersAddModal .tab-link').click();
  };

  $scope.addOppenentsLawyers = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#oppenentsLawyersAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/oppenents_lawyers/add",
      data: $scope.oppenents_lawyers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#oppenentsLawyersAddModal');
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

  $scope.displayUpdateOppenentsLawyers = function (oppenent) {
    $scope.error = '';
    $scope.detailsOppenentsLawyers(oppenent);
    $scope.oppenents_lawyers = {};
    $scope.showOpeningBalance = false;
    site.showModal('#oppenentsLawyersUpdateModal');
    document.querySelector('#oppenentsLawyersUpdateModal .tab-link').click();
  };

  $scope.displaybankingAndAccounting = function (event) {

    site.showTabContent(event, '#bankingAndAccounting');

    let num = 0;
    let ln = $scope.oppenents_lawyers.opening_balance;

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
      $scope.oppenents_lawyers.balance = parseInt(num);
  };



  $scope.updateOppenentsLawyers = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#oppenentsLawyersUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/oppenents_lawyers/update",
      data: $scope.oppenents_lawyers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#oppenentsLawyersUpdateModal');
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

  $scope.displayDeleteOppenentsLawyers = function (oppenent) {
    $scope.error = '';
    $scope.detailsOppenentsLawyers(oppenent);
    $scope.oppenents_lawyers = {};
    site.showModal('#oppenentsLawyersDeleteModal');
    document.querySelector('#oppenentsLawyersDeleteModal .tab-link').click();
  };

  $scope.deleteOppenentsLawyers = function () {
    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/oppenents_lawyers/delete",
      data: {
        id: $scope.oppenents_lawyers.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#oppenentsLawyersDeleteModal');
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

  $scope.displayDetailsOppenentsLawyers = function (oppenent) {
    $scope.error = '';
    $scope.detailsOppenentsLawyers(oppenent);
    $scope.oppenents_lawyers = {};
    site.showModal('#oppenentsLawyersDetailsModal');
    document.querySelector('#oppenentsLawyersDetailsModal .tab-link').click();
  };

  $scope.detailsOppenentsLawyers = function (oppenent) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/oppenents_lawyers/view",
      data: {
        id: oppenent.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.oppenents_lawyers = response.data.doc;
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
    site.showModal('#oppenentsLawyersSendEmailModal');
  };

  $scope.getOppenentsLawyersList = function (where) {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/oppenents_lawyers/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
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
        select: { id: 1, name: 1 ,
          code : 1}
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
        select: { id: 1, name: 1 ,
          code : 1}
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



  $scope.searchAll = function () {

    let where = {};

    if ($scope.search.code) {

      where['code'] = $scope.search.code;
    }
    if ($scope.search.name_ar) {

      where['name_ar'] = $scope.search.name_ar;
    }
    if ($scope.search.name_en) {

      where['name_en'] = $scope.search.name_en;
    }
    if ($scope.search.nationality) {

      where['nationality'] = $scope.search.nationality;
    }
    if ($scope.search.gov) {

      where['gov'] = $scope.search.gov;
    }
    if ($scope.search.city) {

      where['city'] = $scope.search.city;
    }
    if ($scope.search.phone) {

      where['phone'] = $scope.search.phone;
    }
    if ($scope.search.mobile) {

      where['mobile'] = $scope.search.mobile;
    }
    where['active'] = 'all';

    $scope.getOppenentsLawyersList(where);

    site.hideModal('#oppenentsLawyersSearchModal');
    $scope.search = {}

  };

  $scope.getOppenentsLawyersList();
  $scope.getGovList();
  $scope.getGender();
  $scope.loadMaritalsStatus();
  $scope.loadMilitariesStatus();
});