app.controller("oppenents", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.oppenent = {};

  $scope.displayAddOppenents = function () {
    $scope.error = '';
    $scope.oppenent = {
      image_url: '/images/oppenents.png',
      active: true
    };
  
    site.showModal('#oppenentAddModal');
    document.querySelector('#oppenentAddModal .tab-link').click();
  };

  $scope.addOppenents = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#oppenentAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/oppenents/add",
      data: $scope.oppenent
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#oppenentAddModal');
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

  $scope.displayUpdateOppenents = function (oppenent) {
    $scope.error = '';
    $scope.detailsOppenents(oppenent);
    $scope.oppenent = {};
    site.showModal('#oppenentUpdateModal');
    $scope.showOpeningBalance = false;
    document.querySelector('#oppenentUpdateModal .tab-link').click();
  };

  $scope.displaybankingAndAccounting = function (event) {

    site.showTabContent(event, '#bankingAndAccounting');

    let num = 0;
    let ln = $scope.oppenent.opening_balance;

    for (let i = 0; i < ln.length; i++) {
      if (ln[i].initial_balance > 0) {

        if (ln[i].balance_type == "credit") {
          num = num - parseInt(ln[i].initial_balance);

        } else {
          num = num + parseInt(ln[i].initial_balance);
        }

      }

    }

    if ($scope.showOpeningBalance) {

      $scope.oppenent.balance = parseInt(num);
    }



  };



  $scope.updateOppenents = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#oppenentUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/oppenents/update",
      data: $scope.oppenent
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#oppenentUpdateModal');
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

  $scope.displayDeleteOppenents = function (oppenent) {
    $scope.error = '';
    $scope.detailsOppenents(oppenent);
    $scope.oppenent = {};
    site.showModal('#oppenentDeleteModal');
    document.querySelector('#oppenentDeleteModal .tab-link').click();
  };

  $scope.deleteOppenents = function () {
    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/oppenents/delete",
      data: {
        id: $scope.oppenent.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#oppenentDeleteModal');
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

  $scope.displayDetailsOppenents = function (oppenent) {
    $scope.error = '';
    $scope.detailsOppenents(oppenent);
    $scope.oppenent = {};
    site.showModal('#oppenentDetailsModal');
    document.querySelector('#oppenentDetailsModal .tab-link').click();
  };

  $scope.detailsOppenents = function (oppenent) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/oppenents/view",
      data: {
        id: oppenent.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.oppenent = response.data.doc;
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
    site.showModal('#oppenentSendEmailModal');
  };

  $scope.getOppenentsList = function (where) {
    $scope.error = '';


    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/oppenents/all",
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
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 }
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
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 }
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
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 }
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
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 }
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

    $scope.getOppenentsList($scope.search);
    site.hideModal('#oppenentSearchModal');
    $scope.search ={};
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "oppenents"
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
  $scope.getOppenentsList();
  $scope.getGovList();
  $scope.getGender();
  $scope.loadMaritalsStatus();
  $scope.loadMilitariesStatus();
});