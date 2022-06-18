app.controller('sub_categories_3', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.sub_categories_3 = {};

  $scope.displayAddSubCategories3 = function () {
    $scope.error = '';
    $scope.sub_categories_3 = {
      image_url: '/images/sub_categories_3.png',
      active: true /* ,
      immediate : false */,
    };
    site.showModal('#subCategories3AddModal');
  };

  $scope.addSubCategories3 = function () {
    $scope.error = '';
    const v = site.validated('#subCategories3AddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/sub_categories_3/add',
      data: $scope.sub_categories_3,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subCategories3AddModal');
          $scope.getSubCategories3List();
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

  $scope.displayUpdateSubCategories3 = function (sub_categories_3) {
    $scope.error = '';
    $scope.viewSubCategories3(sub_categories_3);
    $scope.sub_categories_3 = {};
    site.showModal('#subCategories3UpdateModal');
  };

  $scope.updateSubCategories3 = function () {
    $scope.error = '';
    const v = site.validated('#subCategories3UpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/sub_categories_3/update',
      data: $scope.sub_categories_3,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subCategories3UpdateModal');
          $scope.getSubCategories3List();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsSubCategories3 = function (sub_categories_3) {
    $scope.error = '';
    $scope.viewSubCategories3(sub_categories_3);
    $scope.sub_categories_3 = {};
    site.showModal('#subCategories3ViewModal');
  };

  $scope.viewSubCategories3 = function (sub_categories_3) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/sub_categories_3/view',
      data: {
        id: sub_categories_3.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.sub_categories_3 = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteSubCategories3 = function (sub_categories_3) {
    $scope.error = '';
    $scope.viewSubCategories3(sub_categories_3);
    $scope.sub_categories_3 = {};
    site.showModal('#subCategories3DeleteModal');
  };

  $scope.deleteSubCategories3 = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/sub_categories_3/delete',
      data: {
        id: $scope.sub_categories_3.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subCategories3DeleteModal');
          $scope.getSubCategories3List();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getSubCategories3List = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/sub_categories_3/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#subCategories3SearchModal');
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

  $scope.loadSubCategories1 = function (main_category) {
    $scope.error = '';
    $scope.busy = true;
    $scope.subCategories1 = [];
    $http({
      method: 'POST',
      url: '/api/sub_categories_1/all',
      data: {
        where: {
          'main_category.id': main_category.id,
          active: true,
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
        if (response.data.done) $scope.subCategories1 = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadSubCategories2 = function (sub_category_1) {
    $scope.error = '';
    $scope.busy = true;
    $scope.subCategories2 = [];
    $http({
      method: 'POST',
      url: '/api/sub_categories_2/all',
      data: {
        where: {
          'sub_category_1.id': sub_category_1.id,
          active: true,
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
        if (response.data.done) $scope.subCategories2 = response.data.list;
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
        screen: 'sub_categories_3',
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
    site.showModal('#subCategories3SearchModal');
  };

  $scope.searchAll = function () {
    $scope.getSubCategories3List($scope.search);
    site.hideModal('#subCategories3SearchModal');
    $scope.search = {};
  };

  $scope.getSubCategories3List();
  $scope.loadMainCategories();
  $scope.getNumberingAuto();
});
