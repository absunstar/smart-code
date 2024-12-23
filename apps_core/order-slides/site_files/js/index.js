app.controller("order_slides", function ($scope, $http) {

  $scope.order_slides = {};

  $scope.loadAll = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_slides/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.newOrderSlides = function () {
    $scope.error = '';
    $scope.order_slides = { image_url: '/images/slides.png', salary_calculate: false };
    site.showModal('#addOrderSlidesModal');
  };
  $scope.add = function () {

    $scope.error = '';
    const v = site.validated('#addOrderSlidesModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_slides/add",
      data: $scope.order_slides
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addOrderSlidesModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
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

  $scope.edit = function (order_slides) {
    $scope.error = '';
    $scope.view(order_slides);
    $scope.order_slides = {};
    site.showModal('#updateOrderSlidesModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_slides/update",
      data: $scope.order_slides
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateOrderSlidesModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.remove = function (order_slides) {
    $scope.error = '';
    $scope.view(order_slides);
    $scope.order_slides = {};
    site.showModal('#deleteOrderSlidesModal');
  };

  $scope.view = function (order_slides) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_slides/view",
      data: { id: order_slides.id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.order_slides = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.details = function (order_slides) {
    $scope.error = '';
    $scope.view(order_slides);
    $scope.order_slides = {};
    site.showModal('#viewOrderlidesModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_slides/delete",
      data: { id: $scope.order_slides.id, name: $scope.order_slides.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteOrderSlidesModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
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
        screen: "order_slides"
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


  $scope.loadAll();
  $scope.getNumberingAuto();
});
