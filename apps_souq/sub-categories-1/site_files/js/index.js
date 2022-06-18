app.controller('sub_categories_1', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.sub_categories_1 = {};

  $scope.displayAddSubCategories1 = function () {
    $scope.error = '';
    $scope.sub_categories_1 = {
      image_url: '/images/sub_categories_1.png',
      active: true /* ,
      immediate : false */,
    };
    site.showModal('#subCategories1AddModal');
  };

  $scope.addSubCategories1 = function () {
    $scope.error = '';
    const v = site.validated('#subCategories1AddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/sub_categories_1/add',
      data: $scope.sub_categories_1,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subCategories1AddModal');
          $scope.getSubCategories1List();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateSubCategories1 = function (sub_categories_1) {
    $scope.error = '';
    $scope.viewSubCategories1(sub_categories_1);
    $scope.sub_categories_1 = {};
    site.showModal('#subCategories1UpdateModal');
  };

  $scope.updateSubCategories1 = function () {
    $scope.error = '';
    const v = site.validated('#subCategories1UpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/sub_categories_1/update',
      data: $scope.sub_categories_1,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subCategories1UpdateModal');
          $scope.getSubCategories1List();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsSubCategories1 = function (sub_categories_1) {
    $scope.error = '';
    $scope.viewSubCategories1(sub_categories_1);
    $scope.sub_categories_1 = {};
    site.showModal('#subCategories1ViewModal');
  };

  $scope.viewSubCategories1 = function (sub_categories_1) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/sub_categories_1/view',
      data: {
        id: sub_categories_1.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.sub_categories_1 = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteSubCategories1 = function (sub_categories_1) {
    $scope.error = '';
    $scope.viewSubCategories1(sub_categories_1);
    $scope.sub_categories_1 = {};
    site.showModal('#subCategories1DeleteModal');
  };

  $scope.deleteSubCategories1 = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/sub_categories_1/delete',
      data: {
        id: $scope.sub_categories_1.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subCategories1DeleteModal');
          $scope.getSubCategories1List();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getSubCategories1List = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/sub_categories_1/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#subCategories1SearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadMainCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.mainCategories = [];
    $http({
      method: 'POST',
      url: '/api/main_categories/all',
      data: {
        where: {
          active : true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.mainCategories = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'sub_categories_1',
      },
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
    );
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#subCategories1SearchModal');
  };

  $scope.searchAll = function () {
    $scope.getSubCategories1List($scope.search);
    site.hideModal('#subCategories1SearchModal');
    $scope.search = {};
  };

  $scope.getSubCategories1List();
  $scope.loadMainCategories();
  $scope.getNumberingAuto();
});
