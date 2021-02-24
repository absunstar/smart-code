app.controller("report_analysis_requests", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_analysis_requests = {};


  $scope.getReportInvoicesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/analysis_requests/all",
      data: {
        where: where,
        report: true
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.all_list.length > 0) {
          $scope.list = response.data.all_list;
          $scope.total_price = 0;
          $scope.total_discount = 0;
          $scope.total_value = 0;

          $scope.list.forEach(_l => {
            $scope.total_price += _l.net_value || 0;
            $scope.total_discount += _l.total_discount || 0;
            $scope.total_value += _l.total_value || 0;

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

  $scope.showPersonDelivery = function (analysis_requests, type) {

    $scope.delivery_person = Object.assign({}, analysis_requests);
    if (type === 'view') {
      $scope.delivery_person.$view = true;
    }

    site.showModal('#deliveryPersonModal');

  };


  $scope.displayDetailsAnalysisRequests = function (analysis) {
    $scope.error = '';
    $scope.detailsAnalysisRequests(analysis);
    $scope.analysis = {};
    site.showModal('#doctorsVisitsViewModal');
    document.querySelector('#doctorsVisitsViewModal .tab-link').click();

  };

  $scope.detailsAnalysisRequests = function (analysis) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/analysis/view",
      data: {
        id: analysis.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.analysis = response.data.doc;
          $scope.clinicList = [$scope.analysis.selected_clinic];

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.getAnalysisList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analysis/all",
      data: {
        where: {
          active: true
        },
        select: { id: 1, name: 1, price: 1, delivery_time: 1, period: 1, immediate: 1 }
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
    site.hideModal('#reportAnalysisRequestsSearchModal');
  };


  $scope.getDefaultSettings();
  $scope.getAnalysisList();

});