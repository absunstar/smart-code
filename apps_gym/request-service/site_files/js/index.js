app.controller("request_service", function ($scope, $http, $timeout) {

  $scope.request_service = {};

  $scope.displayAddRequestService = function () {
    $scope.error = '';
    $scope.discount = {};
    $scope.request_service = {
      image_url: '/images/request_service.png',
      active: true,
      /* capaneighborhood : " - طالب", */
/*       immediate: false
 */    };
    site.showModal('#requestServiceAddModal');
  };

  $scope.addRequestService = function () {
    $scope.error = '';
    const v = site.validated('#requestServiceAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/add",
      data: $scope.request_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceAddModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceUpdateModal');
  };

  $scope.updateRequestService = function () {
    $scope.error = '';
    const v = site.validated('#requestServiceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/update",
      data: $scope.request_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceUpdateModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceViewModal');
  };

  $scope.viewRequestService = function (request_service) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/request_service/view",
      data: {
        id: request_service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.request_service = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceDeleteModal');

  };

  $scope.deleteRequestService = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/request_service/delete",
      data: {
        id: $scope.request_service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceDeleteModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getRequestServiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/request_service/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#requestServiceSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCustomerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
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

  $scope.getServiceList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/service/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.servicesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getHallList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.hallsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          'job.trainer': true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.trainersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadDiscountTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {
          id: 1,
          name: 1,
          value: 1,
          type: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.discount_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

 /*  $scope.getPeriod = function () {
    $scope.busy = true;
    $scope.periodList = [];
    $http({
      method: "POST",
      url: "/api/period_class/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.periodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  }; */

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#requestServiceSearchModal');

  };

  $scope.changeService = function (request_service) {

    request_service.services_price = request_service.service.services_price;
    request_service.service_count = request_service.service.service_count;

  };

  $scope.startDateToDay = function () {

    $scope.request_service.from_date = new Date();

  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {

      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.discount.type = 'number';

      $scope.request_service.discountes = $scope.request_service.discountes || [];
      $scope.request_service.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });

    };
  };

  $scope.calc = function () {
    $scope.error = '';
    $timeout(() => {
      let total_discount = 0;
      $scope.request_service.paid_require = Number($scope.request_service.services_price);
      if ($scope.request_service.discountes && $scope.request_service.discountes.length > 0) {
        $scope.request_service.discountes.forEach(ds => {
          if (ds.type === "percent") {
            total_discount * parseFloat(ds.value) / 100;
          } else {
            total_discount += parseFloat(ds.value);
          };
        });
      };
      $scope.request_service.paid_require = (Number($scope.request_service.services_price) * Number($scope.request_service.service_count || 1)) - total_discount;
    }, 200);
  };


  $scope.deleteDiscount = function (_ds) {
    $scope.request_service.discountes.splice($scope.request_service.discountes.indexOf(_ds), 1);
  };


  $scope.searchAll = function () {
    $scope.getRequestServiceList($scope.search);
    site.hideModal('#requestServiceSearchModal');
    $scope.search = {};

  };

  $scope.getRequestServiceList();
/*   $scope.getPeriod();
 */ 
 $scope.getCustomerList();
  $scope.getServiceList();
  $scope.getHallList();
  $scope.getTrainerList();
  $scope.loadDiscountTypes();
});