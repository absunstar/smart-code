app.controller('main_categories', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.main_categories = {};

  $scope.displayAddMainCategories = function (parent_main_category) {
    $scope._search = {};

    $scope.error = '';

    if (parent_main_category && parent_main_category.type == 'detailed') {
      return;
    }

    $scope.main_categories = {
      type: 'detailed',
      status: 'active',
      image_url: '/images/main_categories.png',
    };

    if (parent_main_category) {
      $scope.main_categories.parent_id = parent_main_category.id;
      $scope.main_categories.top_parent_id = parent_main_category.top_parent_id || parent_main_category.id;
    }

    if ($scope.main_categories.top_parent_id) {
      $scope.main_categories = {
        code: parent_main_category.code,
        type: 'detailed',
        status: parent_main_category.status,
        image_url: parent_main_category.image_url,
      };

      $scope.main_categories.parent_id = parent_main_category.id;
      $scope.main_categories.top_parent_id = parent_main_category.top_parent_id || parent_main_category.id;
    }

    if ($scope.default_setting.auto_generate_categories_code) {
      $scope.main_categories.length_category = $scope.default_setting.length_category || 0;
    }

    site.showModal('#mainCategoriesAddModal');
  };

  $scope.addMainCategories = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#mainCategoriesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/main_categories/add',
      data: $scope.main_categories,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.main_categories = {
            type: 'detailed',
            status: 'active',
            image_url: '/images/main_categories.jpg',
          };

          site.hideModal('#mainCategoriesAddModal');

          $scope.list.push(response.data.doc);
          $scope.getMainCategoriesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key*')) {
            $scope.error = '##word.main_categories_code_err##';
          } else if (response.data.error.like('*enter tree code*')) {
            $scope.error = '##word.enter_code_tree##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateMainCategories = function (main_categories) {
    $scope._search = {};

    $scope.error = '';
    $scope.viewMainCategories(main_categories ,'update');
    $scope.main_categories = {};

    site.showModal('#mainCategoriesUpdateModal');
  };

  $scope.updateMainCategories = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#mainCategoriesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      alert('validated error');
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/main_categories/update',
      data: $scope.main_categories,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainCategoriesUpdateModal');
      
          $scope.getMainCategoriesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Detailed Err*')) {
            $scope.error = '##word.detailed_err##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayViewMainCategories = function (main_categories) {
    $scope.error = '';
    $scope.viewMainCategories(main_categories);
    $scope.main_categories = {};
    site.showModal('#mainCategoriesDetailsModal');
  };

  $scope.viewMainCategories = function (main_categories, type) {
    $scope.error = '';
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/main_categories/view',
      data: {
        id: main_categories.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (type == 'update') {
            console.log("Dddddddddddddddddddd");
            $scope.main_categories = response.data.doc;
          } else {
            $scope.main_categories_view = response.data.doc;
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteMainCategories = function (main_categories) {
    $scope.error = '';
    $scope.viewMainCategories(main_categories);
    $scope.main_categories_view = {};
    site.showModal('#mainCategoriesDeleteModal');
  };

  $scope.deleteMainCategories = function (main_category) {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/main_categories/delete',
      data: {
        id: main_category.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainCategoriesDeleteModal');

          $scope.getMainCategoriesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Delete Acc Err*')) {
            $scope.error = '##word.cant_delete##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getMainCategoriesList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];

    $http({
      method: 'POST',
      url: '/api/main_categories/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          response.data.list.forEach((n) => {
            n.name2 = n.code + '-' + n.name;
          });
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getMainCategoriesList(where);
    site.hideModal('#mainCategoriesSearchModal');
    $scope.search = {};
  };

  $scope.getCodeType = function () {
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data) {
          $scope.default_setting = response.data.doc;
          $scope.disabledCode = response.data.doc.auto_generate_categories_code == true ? true : false;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCodeType();

  $scope.getMainCategoriesList();
});
