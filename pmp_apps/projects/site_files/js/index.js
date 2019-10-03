app.controller("projects", function ($scope, $http, $timeout) {

  $scope.project = {};
  $scope.timer='';

  $scope.searchAll = function () {
    let where = {};

    if ($scope.search.name) {
      where['name'] = $scope.search.name;

    }


    if ($scope.search.percent) {
      where['percent'] = $scope.search.percent;

    }

    if ($scope.search.status == true || $scope.search.status == false) {
      where['active'] = $scope.search.status;
    }



    $scope.getProjectList(where);
    site.hideModal('#projectSearchModal');
  };


  $scope.getProjectList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/projects/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#projectSearchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };


  $scope.getDeveloperList = function (where) {
    $scope.busy = true;
    $scope.developerList = [];
    $http({
      method: "POST",
      url: "/api/developers/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.developerList = response.data.list;


        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getTimesList = function () {
    $http({
      method: "POST",
      url: "/api/times/all"
    }).then(
      function (response) {
        $scope.timesList = response.data;
      },
    )
  };

  $scope.taskStatus = function () {
    $http({
      method: "POST",
      url: '/api/project_status/all'
    }).then(
      function (response) {
        $scope.taskState = response.data;
      }
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#projectSearchModal');

  };

  $scope.displayAddProject = function () {
    $scope.error = '';
    $scope.project = {
      logo: '/images/project.png',
      active: true,
      app_list: [{}],
      developers_list: [{}],
      startup_date: new Date(),
      deadline_date: new Date(),
      status: $scope.taskState[0],
      percent: 0,
      times: $scope.timesList[1]
    };

    site.showModal('#projectAddModal');
    document.querySelector('#projectAddModal .tab-link').click();
  };

  $scope.addProject = function () {
    $scope.error = '';

    const v = site.validated('#projectAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/projects/add",
      data: $scope.project
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#projectAddModal');
          $scope.getProjectList();
        } else {
          $scope.error = '##word.project_already_exisit##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateProject = function (project) {
    $scope.error = '';
    $scope.detailsProject(project);
    $scope.project = {};
    site.showModal('#projectUpdateModal');
    document.querySelector('#projectUpdateModal .tab-link').click();
  };

  $scope.updateProject = function () {
    $scope.error = '';
    const v = site.validated('#projectUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/projects/update",
      data: $scope.project
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#projectUpdateModal');
          $scope.getProjectList();
        } else {
          $scope.error = '##word.project_already_exisit##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteProject = function (project) {
    $scope.error = '';
    $scope.detailsProject(project);
    $scope.project = {};
    site.showModal('#projectDeleteModal');
    document.querySelector('#projectDeleteModal .tab-link').click();
  };

  $scope.deleteProject = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/projects/delete",
      data: {
        id: $scope.project.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#projectDeleteModal');
          $scope.getProjectList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsProject = function (project) {
    $scope.error = '';
    $scope.chownTimer(project.deadline_date);
    $scope.detailsProject(project);
    $scope.project = {};
    site.showModal('#projectViewModal');
    document.querySelector('#projectViewModal .tab-link').click();
  };

  $scope.detailsProject = function (project) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/projects/view",
      data: {
        id: project.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.project = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  if ('##query.action##' === 'add') {
    $scope.displayAddProject();
  };


  $scope.chownTimer = function (date) {
    let deadline = new Date(date).getTime();

    setInterval(function () {
      let now = new Date().getTime();
      let t = deadline - now;
      let days = Math.floor(t / (1000 * 60 * 60 * 24));
      let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((t % (1000 * 60)) / 1000);
      $scope.timer= days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
      
    console.log($scope.timer);
      
    
    }, 1000);
  };



  
  $scope.clacDate = function () {


    
    setTimeout(function () {

      if ($scope.project.times.converter != 0) {
        let d = $scope.project.time_period*$scope.project.times.converter;
        let st = $scope.project.startup_date;
       
        $scope.project.deadline_date = new Date(st.getFullYear(), st.getMonth(), st.getDate() + d); 
        
      }
    }, 500);




  };

  $scope.getProjectList();
  $scope.getDeveloperList();
  $scope.taskStatus();
  $scope.getTimesList();
});