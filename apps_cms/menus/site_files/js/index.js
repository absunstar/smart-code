app.controller('menus', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.menu = {};
  $scope.siteSetting = site.showObject('##data.#setting##');
  
  $scope.displayAddMenu = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.menu = {
      active: true,
      translatedList: [],
    };
    $scope.siteSetting.languageList.forEach((l) => {
      if (l.active == true) {
        $scope.menu.translatedList.push({
          language: {
            id: l.id,
            name: l.name,
          },
          showImage: true,
        });
      }
    });
    site.showModal('#menuManageModal');
  };

  $scope.addMenu = function () {
    $scope.error = '';
    const v = site.validated('#menuManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
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
      $scope.error = v.messages[0].Ar;
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

  $scope.upDownMainList = function (type, index) {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    let i = 0;
    if (type == 'up') {
      i = index - 1;
    } else {
      i = index + 1;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/menus/updateSort',
      data: { type, id: $scope.list[index].id, id2: $scope.list[i].id },
    }).then(
      function (response) {
        if (response.data.done) {
          $scope.getMenuList();
        } else {
          $scope.error = response.data.error;
          $scope.busy = false;
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
          $scope.siteSetting.languageList.forEach((l) => {
            if (l.active == true && !$scope.menu.translatedList.find((t) => t.language.id == l.id)) {
              $scope.menu.translatedList.push({
                language: {
                  id: l.id,
                  name: l.name,
                },
                showImage: true,
              });
            }
          });
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
    $scope.count = 0;
    $http({
      method: 'POST',
      url: '/api/menus/all',
      data: {
        where: where,
        search: $scope.$search,
        select: {},
        sort: { sort: 1 },
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

  $scope.autoCategoriesToMenus = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/autoCategoriesMenus/all',
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getMenuList();
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
      url: '/api/linkTypeList',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.linkTypeList = response.data.list;
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
    $http({
      method: 'POST',
      url: '/api/categories/all',
      data: {
        where: {
          active: true,
        },
        select: { id: 1, translatedList: 1, parentListId: 1, topParentId: 1, parentId: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.categoryList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
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

  $scope.smartSearch = function () {
    $timeout(() => {
      $scope.getMenuList();
    }, 200);
  };
  $scope.upDownList = function (list, type, index) {
    let element = list[index];
    let toIndex = index;

    if (type == 'up') {
      toIndex = index - 1;
    } else if (type == 'down') {
      toIndex = index + 1;
    }

    list.splice(index, 1);
    list.splice(toIndex, 0, element);
  };

  $scope.displayActionSubMenu = function (index, mode) {
    $scope.error = '';
    $scope.subMenu = {};
    $scope.menu.$subIndex = index;
    $scope.subMenu = { ...$scope.menu.subList[index], $mode: mode };
    $scope.subMenu.translatedList = [];
    for (let i = 0; i < $scope.menu.subList[index].translatedList.length; i++) {
      $scope.subMenu.translatedList.push({ ...$scope.menu.subList[index].translatedList[i] });
    }
    site.showModal('#subMenuModal');
  };

  $scope.updateSubMenu = function () {
    $scope.error = '';
    const v = site.validated('#subMenuModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.menu.subList[$scope.menu.$subIndex] = $scope.subMenu;
    site.hideModal('#subMenuModal');
    $scope.subMenu = {};
  };

  $scope.deleteSubMenu = function () {
    $scope.error = '';
    $scope.menu.subList.splice($scope.menu.$subIndex, 1);
    site.hideModal('#subMenuModal');
    $scope.subMenu = {};
  };

  $scope.showAddSubMenu = function () {
    $scope.error = '';
    $scope.subMenu = { $mode: 'add', active: true, translatedList: [] };
    $scope.siteSetting.languageList.forEach((l) => {
      if (l.active == true) {
        $scope.subMenu.translatedList.push({
          language: {
            id: l.id,
            name: l.name,
          },
          showImage: true,
        });
      }
    });
    site.showModal('#subMenuModal');
  };

  $scope.addSubMenu = function (sub) {
    $scope.error = '';
    const v = site.validated('#subMenuModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.menu.subList = $scope.menu.subList || [];
    $scope.menu.subList.unshift(sub);
    $scope.subMenu = {};
    site.hideModal('#subMenuModal');
  };

  $scope.searchAll = function () {
    $scope.error = '';
    $scope.getMenuList($scope.search);
    site.hideModal('#menuSearchModal');
    $scope.search = {};
  };

  $scope.getMenuList();
  $scope.loadCategories();
  $scope.getLinkTypeList();
});
