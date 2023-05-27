app.controller('menus', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.menu = {};

  $scope.displayAddMenu = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.menu = {
      active: true,
      translatedList : []
    };
    $scope.defaultSettings.languagesList.forEach((l) => {
      if (l.language.active == true) {
        $scope.menu.translatedList.push({
          language: {
            id: l.language.id,
            en: l.language.en,
            ar: l.language.ar,
          },
        });
      }
    });
    site.showModal('#menuManageModal');
  };

  $scope.addMenu = function () {
    $scope.error = '';
    const v = site.validated('#menuManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/menus/add',
      data: $scope.menu,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#menuManageModal');
          $scope.getMenuList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*select category*')) {
            $scope.error = '##word.category_must_selected##';
          } else if (response.data.error.like('*select Page*')) {
            $scope.error = '##word.page_must_selected##';
          } else if (response.data.error.like('*select external link*')) {
            $scope.error = '##word.external_link_must_selected##';
          } else if (response.data.error.like('*select internal link*')) {
            $scope.error = '##word.internal_link_must_selected##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateMenu = function (menu) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewMenu(menu);
    $scope.menu = {};
    site.showModal('#menuManageModal');
  };

  $scope.updateMenu = function () {
    $scope.error = '';
    const v = site.validated('#menuManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/menus/update',
      data: $scope.menu,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#menuManageModal');
          $scope.getMenuList();
        } else {
          if (response.data.error.like('*select category*')) {
            $scope.error = '##word.category_must_selected##';
          } else if (response.data.error.like('*select Page*')) {
            $scope.error = '##word.page_must_selected##';
          } else if (response.data.error.like('*select external link*')) {
            $scope.error = '##word.external_link_must_selected##';
          } else if (response.data.error.like('*select internal link*')) {
            $scope.error = '##word.internal_link_must_selected##';
          }
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsMenu = function (menu) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewMenu(menu);
    $scope.menu = {};
    site.showModal('#menuManageModal');
  };

  $scope.viewMenu = function (menu) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/menus/view',
      data: {
        id: menu.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.menu = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteMenu = function (menu) {
    $scope.error = '';

    $scope.mode = 'delete';
    $scope.viewMenu(menu);
    $scope.menu = {};
    site.showModal('#menuManageModal');
  };

  $scope.deleteMenu = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/menus/delete',
      data: {
        id: $scope.menu.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#menuManageModal');
          $scope.getMenuList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getMenuList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/menus/all',
      data: {
        where: where,
        select: { id: 1, translatedList: 1, name: 1, linkageType: 1, active: 1, image : 1 },

      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#menuSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getLinkTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.linkTypeList = [];
    $http({
      method: 'POST',
      url: '/api/linkageType/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.linkTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#menuSearchModal');
  };

  $scope.loadCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.categoryList = [];
    $scope.topCategoryList = [];
    $http({
      method: 'POST',
      url: '/api/categories/all',
      data: {
        where: {
          active: true,
        },
        select: { id: 1, translatedList: 1, parentListId: 1, topParentId: 1, parentId: 1},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.categoryList = response.data.list;
          $scope.topCategoryList = response.data.topList;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadSubCategory1 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList1 = [];
    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c && c.id == _c.parentId) {
        $scope.subCategoriesList1.push(_c);
      }
    });
  };

  $scope.loadSubCategory2 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c && c.id == _c.parentId) {
        $scope.subCategoriesList2.push(_c);
      }
    });
  };

  $scope.loadSubCategory3 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c && c.id == _c.parentId) {
        $scope.subCategoriesList3.push(_c);
      }
    });
  };

  $scope.loadSubCategory4 = function (c) {
    $scope.error = '';
    $scope.subCategoriesList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c && c.id == _c.parentId) {
        $scope.subCategoriesList4.push(_c);
      }
    });
  };

  $scope.loadPages = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.pagesList = [];
    $http({
      method: 'POST',
      url: '/api/pages/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.pagesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/get-site-setting',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.searchAll = function () {
    $scope.getMenuList($scope.search);
    site.hideModal('#menuSearchModal');
    $scope.search = {};
  };

  $scope.getMenuList();
  $scope.loadCategories();
  $scope.getLinkTypeList();
  $scope.getDefaultSetting();
});
