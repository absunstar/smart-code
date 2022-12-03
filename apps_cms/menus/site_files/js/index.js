app.controller("menus", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.menu = {};

  $scope.displayAddMenu = function () {
    $scope.error = '';
    $scope.menu = {
      image_url: '/images/menu.png',
      active: true
    };
    site.showModal('#menuAddModal');
  };

  $scope.addMenu = function () {
    $scope.error = '';
    const v = site.validated('#menuAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/menus/add",
      data: $scope.menu
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#menuAddModal');
          $scope.getMenuList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*select category*')) {
            $scope.error = "##word.category_must_selected##"
          } else if (response.data.error.like('*select Page*')) {
            $scope.error = "##word.page_must_selected##"
          } else if (response.data.error.like('*select external link*')) {
            $scope.error = "##word.external_link_must_selected##"
          } else if (response.data.error.like('*select internal link*')) {
            $scope.error = "##word.internal_link_must_selected##"
          } 
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateMenu = function (menu) {
    $scope.error = '';
    $scope.viewMenu(menu);
    $scope.menu = {};
    site.showModal('#menuUpdateModal');
  };

  $scope.updateMenu = function () {
    $scope.error = '';
    const v = site.validated('#menuUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/menus/update",
      data: $scope.menu
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#menuUpdateModal');
          $scope.getMenuList();
        } else {
          if (response.data.error.like('*select category*')) {
            $scope.error = "##word.category_must_selected##"
          } else if (response.data.error.like('*select Page*')) {
            $scope.error = "##word.page_must_selected##"
          } else if (response.data.error.like('*select external link*')) {
            $scope.error = "##word.external_link_must_selected##"
          } else if (response.data.error.like('*select internal link*')) {
            $scope.error = "##word.internal_link_must_selected##"
          } 
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsMenu = function (menu) {
    $scope.error = '';
    $scope.viewMenu(menu);
    $scope.menu = {};
    site.showModal('#menuViewModal');
  };

  $scope.viewMenu = function (menu) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/menus/view",
      data: {
        id: menu.id
      }
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
    )
  };

  $scope.displayDeleteMenu = function (menu) {
    $scope.error = '';

    $scope.viewMenu(menu);
    $scope.menu = {};
    site.showModal('#menuDeleteModal');
  };

  $scope.deleteMenu = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/menus/delete",
      data: {
        id: $scope.menu.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#menuDeleteModal');
          $scope.getMenuList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  

  $scope.getMenuList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/menus/all",
      data: {
        where: where
      }
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
    )
  };

  $scope.getLinkTypeList = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.linkTypeList = [];
    $http({
      method: "POST",
      url: "/api/linkage_type/all",
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

  $scope.loadMainCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.category_list = [];
    $scope.top_category_list = [];
    $http({
      method: 'POST',
      url: '/api/main_categories/all',
      data: {
        where: {
          status: 'active',
        },
        select: { id: 1, name: 1, parent_list_id: 1, top_parent_id: 1, parent_id: 1, image_url: 1, type: 1 },
        top: true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_list = response.data.list;
          $scope.top_category_list = response.data.top_list;

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
    $scope.category_list.forEach((_c) => {
      if (c && c.id == _c.parent_id) {
        $scope.subCategoriesList1.push(_c);
      }
    });
  };

  $scope.loadSubCategory2 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c && c.id == _c.parent_id) {
        $scope.subCategoriesList2.push(_c);
      }
    });
  };

  $scope.loadSubCategory3 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c && c.id == _c.parent_id) {
        $scope.subCategoriesList3.push(_c);
      }
    });
  };

  $scope.loadSubCategory4 = function (c) {
    $scope.error = '';
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c && c.id == _c.parent_id) {
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
      data: {
      },
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


  $scope.searchAll = function () {

    $scope.getMenuList($scope.search);
    site.hideModal('#menuSearchModal');
    $scope.search = {};
  };

  $scope.getMenuList();
  $scope.loadMainCategories();
  $scope.getLinkTypeList();
});