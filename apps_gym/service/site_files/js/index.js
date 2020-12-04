app.controller("service", function ($scope, $http, $timeout) {

  $scope.service = {};

  $scope.displayAddService = function () {
    $scope.error = '';
    $scope.service = {
      image_url: '/images/service.png',
      active: true,
      attend_count: 1,
      complex_service: false,
      /* capaneighborhood : " - طالب",       
       immediate: false
 */    };
    site.showModal('#serviceAddModal');

  };

  $scope.addService = function () {
    $scope.error = '';
    const v = site.validated('#serviceAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.service.complex_service) {
      $scope.service.attend_count = 0;
      $scope.service.selectedServicesList.forEach(s => {
        $scope.service.attend_count += (s.attend_count * s.count);
      });
    } else {
      $scope.service.selectedServicesList = [];
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/service/add",
      data: $scope.service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#serviceAddModal');
          $scope.getServiceList();
        } else {
          $scope.error = response.data.error;
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

  $scope.displayUpdateService = function (service) {
    $scope.error = '';
    $scope.viewService(service);
    $scope.service = {};
    site.showModal('#serviceUpdateModal');
  };

  $scope.updateService = function () {
    $scope.error = '';
    const v = site.validated('#serviceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/service/update",
      data: $scope.service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#serviceUpdateModal');
          $scope.getServiceList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsService = function (service) {
    $scope.error = '';
    $scope.viewService(service);
    $scope.service = {};
    site.showModal('#serviceViewModal');
  };

  $scope.viewService = function (service) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/service/view",
      data: {
        id: service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.service = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteService = function (service) {
    $scope.error = '';
    $scope.viewService(service);
    $scope.service = {};
    site.showModal('#serviceDeleteModal');

  };

  $scope.deleteService = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/service/delete",
      data: {
        id: $scope.service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#serviceDeleteModal');
          $scope.getServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getServiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/service/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#serviceSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSubscriptionsSystem = function () {
    $scope.busy = true;
    $scope.subscriptionsSystemList = [];
    $http({
      method: "POST",
      url: "/api/subscriptions_system/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.subscriptionsSystemList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getService = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/service/all",
        data: {
          where: { name: $scope.search_service, complex_service: false },
          select: { id: 1, name: 1, code: 1, services_price: 1, selectedServicesList: 1, attend_count: 1 }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              $scope.servicesList = response.data.list;
            }
          }
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.incertServices = function () {
    $scope.error = '';
    $scope.service.selectedServicesList = $scope.service.selectedServicesList || [];

    if ($scope.selectedService && $scope.selectedService.id) {
      $scope.selectedService.count = 1;
      $scope.service.selectedServicesList.unshift($scope.selectedService);
    } else $scope.error = '##word.err_select_service##';

    $scope.selectedService = {};
    $scope.calc();
  };

  $scope.deleteServiceList = function (service) {
    $scope.error = '';
    $scope.service.selectedServicesList.splice($scope.service.selectedServicesList.indexOf(service), 1);
  };

  $scope.calc = function () {
    $scope.error = '';
    $timeout(() => {

      $scope.service.total_complex_services_price = 0;
      $scope.service.selectedServicesList.map(s => $scope.service.total_complex_services_price += Number(s.services_price) * Number(s.count));

    }, 200);
  };


  $scope.attendCalc = function (s) {
    $scope.error = '';
    $scope.service.attend_count = 0;
    $timeout(() => {
      if ($scope.service.complex_service) {
        $scope.service.selectedServicesList.forEach(s => {
          s.total_attend_count = s.attend_count * s.count;
          $scope.service.attend_count += s.total_attend_count;
        });
      }
    }, 100);

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "services"
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
    site.showModal('#serviceSearchModal');

  };

  $scope.searchAll = function () {
    $scope.getServiceList($scope.search);
    site.hideModal('#serviceSearchModal');
    $scope.search = {};

  };

  $scope.getServiceList();
  $scope.getSubscriptionsSystem();
  $scope.getNumberingAuto();
  /*   $scope.getPeriod();
   */
});