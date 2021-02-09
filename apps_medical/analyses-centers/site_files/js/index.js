app.controller("analyses_centers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.analyses_center = {};

  $scope.displayAddAnalysesCenter = function () {
    $scope.error = '';
    $scope.analyses_center = {
      image_url: '/images/analyses_center.png',
      active: true,
      analyses_list:[{active: true}]

    };
    site.showModal('#analysesCenterAddModal');
    document.querySelector('#analysesCenterAddModal .tab-link').click();

  };

  $scope.addAnalysesCenter = function () {
    $scope.error = '';
    const v = site.validated('#analysesCenterAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analyses_centers/add",
      data: $scope.analyses_center
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#analysesCenterAddModal');
          $scope.getAnalysesCenterList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateAnalysesCenter = function (analyses_center) {
    $scope.error = '';
    $scope.detailsAnalysesCenter(analyses_center);
    $scope.analyses_center = {};
    site.showModal('#analysesCenterUpdateModal');
    document.querySelector('#analysesCenterUpdateModal .tab-link').click();
  };

  $scope.updateAnalysesCenter = function () {
    $scope.error = '';
    const v = site.validated('#analysesCenterUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analyses_centers/update",
      data: $scope.analyses_center
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#analysesCenterUpdateModal');
          $scope.getAnalysesCenterList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAnalysesCenter = function (analyses_center) {
    $scope.error = '';
    $scope.detailsAnalysesCenter(analyses_center);
    $scope.analyses_center = {};
    site.showModal('#analysesCenterViewModal');
    document.querySelector('#analysesCenterViewModal .tab-link').click();

  };

  $scope.detailsAnalysesCenter = function (analyses_center) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/analyses_centers/view",
      data: {
        id: analyses_center.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.analyses_center = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAnalysesCenter = function (analysesCenter) {
    $scope.error = '';
    $scope.detailsAnalysesCenter(analysesCenter);
    $scope.analyses_center = {};
    site.showModal('#analysesCenterDeleteModal');
    document.querySelector('#analysesCenterDeleteModal .tab-link').click();

  };

  $scope.deleteAnalysesCenter = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/analyses_centers/delete",
      data: {
        id: $scope.analyses_center.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#analysesCenterDeleteModal');
          $scope.getAnalysesCenterList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAnalysesCenterList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/analyses_centers/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#analysesCenterSearchModal');
          $scope.search ={};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getAnalysisList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analyses/all",
      data: {
        where: {
          active: true
        },
        select:{
          id:1 , name : 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.analysisList = response.data.list;
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
        select:{
          id:1 , name : 1
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

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/cities/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select:{
          id:1 , name : 1
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "analyses_centers"
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
    site.showModal('#analysesCenterSearchModal');

  };

  $scope.searchAll = function () {
   
    $scope.getAnalysesCenterList($scope.search);
    site.hideModal('#analysesCenterSearchModal');
    $scope.search ={};

  };


  $scope.getAnalysesCenterList();
  $scope.getAnalysisList();
  $scope.getNumberingAuto();
  $scope.getGovList();

});