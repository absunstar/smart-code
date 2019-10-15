app.controller("tasks", function ($scope, $http, $timeout) {

  
  
  $scope.task = {};
  $scope.timer='';
  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#taskSearchModal');
  };

  $scope.searchAll = function () {
    let where = {};

    if ($scope.search.name) {
      where['name'] = $scope.search.name;

    }

    if ($scope.search.status == true || $scope.search.status == false) {
      where['active'] = $scope.search.status;
    }

    $scope.getTaskList(where);
    site.hideModal('#taskSearchModal');
  };

  $scope.taskStatus = function () {
    $http({
      method: "POST",
      url: '/api/task_status/all'
    }).then(
      function (response) {
        $scope.taskState = response.data;
      }
    )
  };

  $scope.taskType = function () {
    $http({
      method: "POST",
      url: '/api/task_type/all'
    }).then(
      function (response) {

        
        $scope.taskTypes = response.data;
      }
    )
  };

  $scope.getTimesList = function () {
    $http({
      method: "POST",
      url: '/api/times/all'
    }).then(
      function (response) {
        $scope.timesList = response.data;
      }
    )
  };

  $scope.getDeveloperList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/developers/all",
      data: {
        where: {
          active: true
        }
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

  $scope.getTaskList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/tasks/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTaskNameList = function (project) {
    $scope.busy = true;
    $scope.taskNamelist = [];
    $http({
      method: "POST",
      url: "/api/tasks/all",
      data: {
        where: {
          'project.id': project.id
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.taskNamelist = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getProjectList = function (where) {
    $scope.busy = true;
    $scope.projectList = [];
    $http({
      method: "POST",
      url: "/api/projects/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.projectList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displayAddTask = function () {
    $scope.error = '';
    $scope.task = {
      auto_startup: false,
      startup_date: new Date(),
      deadline_date: new Date(),
      status: $scope.taskState[0],
      appointment_status: {
        id: 1,
        name: "un_appointment",
        en: "Un Appointment",
        ar: "غير معين"
      },
      developerList:[],
      percent: 0,
      times: $scope.timesList[1],
      developers_tracking_list: [{
        operations_list: [{
          id: 1,
          name: "new",
          ar: "جديد",
          en: "New"
        }]
      }],
      active: true,
      type: $scope.taskTypes[0],
      logo: $scope.taskTypes[0].logo
    };

    site.showModal('#taskAddModal');
    document.querySelector('#taskAddModal .tab-link').click();

  };

  $scope.addTask = function () {
    $scope.error = '';

    const v = site.validated('#taskAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
  
    $http({
      method: "POST",
      url: "/api/tasks/add",
      data: $scope.task
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {
          site.hideModal('#taskAddModal');
          $scope.getTaskList();
        } else {
          $scope.error = '##word.task_already_exisit##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateTask = function (task) {
    $scope.error = '';
    $scope.detailsTask(task);
    $scope.task = {};
    site.showModal('#taskUpdateModal');
    document.querySelector('#taskUpdateModal .tab-link').click();
  };

  $scope.updateTask = function () {
    $scope.error = '';
    const v = site.validated('#taskUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tasks/update",
      data: $scope.task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#taskUpdateModal');
          $scope.getTaskList();
        } else {
          $scope.error = '##word.task_already_exisit##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteTask = function (task) {
    $scope.error = '';
    $scope.detailsTask(task);
    $scope.task = {};
    site.showModal('#taskDeleteModal');
    document.querySelector('#taskDeleteModal .tab-link').click();
  };

  $scope.deleteTask = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/tasks/delete",
      data: {
        id: $scope.task.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#taskDeleteModal');
          $scope.getTaskList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsTask = function (task) {
    $scope.error = '';
    $scope.detailsTask(task);
    $scope.task = {};
    site.showModal('#taskViewModal');
    document.querySelector('#taskViewModal .tab-link').click();
  };

  $scope.detailsTask = function (task) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/tasks/view",
      data: {
        id: task.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.task = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAssignTask = function (task) {
    $scope.error = '';
    $scope.detailsTask(task);
    $scope.task = {};
    site.showModal('#taskAssignModal');
  };

  $scope.assignTask = function () {
    $scope.error = '';
    const v = site.validated('#taskAssignModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.task.status = {
      id: 2,
      name: "assigned",
      ar: "موزعة",
      en: "Assigned"
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tasks/assign",
      data: $scope.task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#taskAssignModal');
          $scope.getTaskList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.refuseTask = function (task) {
    $scope.error = '';
    $scope.busy = true;
    $scope.task.status = {
      id: 3,
      name: "refused",
      ar: "مرفوضة",
      en: "Refused"
    };
    $http({
      method: "POST",
      url: "/api/tasks/refuse_task",
      data: task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getTaskList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.cancelTask = function (task) {
    $scope.error = '';
    $scope.busy = true;
    $scope.task.status = {
      id: 10,
      name: "canceled",
      ar: "ملغية",
      en: "canceled"
    };
    $http({
      method: "POST",
      url: "/api/tasks/cancel_task",
      data: task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getTaskList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.doneTask = function (task) {
    $scope.error = '';
    $scope.busy = true;
    $scope.task.status = {
      id: 6,
      name: "pending_review",
      ar: "جاري المراجعة",
      en: "Pending Review"
    };
    $scope.task.percent=50;
    $http({
      method: "POST",
      url: "/api/tasks/done_task",
      data: task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getTaskList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.displayRefus = function(c){
    $scope.task=c;
    
    site.showModal('#reviewModal');
  };


  $scope.reviewTask = function (task) {
    $scope.error = '';
    $scope.busy = true;
   
    $scope.task.developers_tracking_list[$scope.task.developers_tracking_list.length - 1].review=task.body ;
    
    
    $http({
      method: "POST",
      url: "/api/tasks/review_task",
      data:  $scope.task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reviewModal');
          $scope.getTaskList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.testTask = function (task) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tasks/test_task",
      data: task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getTaskList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.completeTask = function (task) {
    $scope.error = '';
    $scope.busy = true;
    $scope.task.status = {
      id: 9,
      name: "completed",
      ar: "مكتملة",
      en: "Completed"
    };
    $scope.task.percent=100; 

    $http({
      method: "POST",
      url: "/api/tasks/complete_task",
      data: task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getTaskList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.reopenTask = function (task) {
    $scope.error = '';
    $scope.busy = true;
    $scope.task.status = {
      id: 11,
      name: "reopened",
      ar: "معاد فتحها",
      en: "Reopened"
    };
    $http({
      method: "POST",
      url: "/api/tasks/reopen_task",
      data: task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getTaskList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.acceptTask = function (task) {
    $scope.error = '';
    $scope.busy = true;
    $scope.task.status = {
      id: 5,
      name: "pending",
      ar: "جاري التنفيذ",
      en: "Pending"
    };
    $scope.task.percent=25; 

    $http({
      method: "POST",
      url: "/api/tasks/accept_task",
      data: task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getTaskList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getTaskList();
  $scope.getProjectList();
  $scope.getDeveloperList();
  $scope.taskStatus();
  $scope.taskType();
  $scope.getTimesList();


  

  $scope.clacDate = function () {



    setTimeout(function () {

      if ($scope.task.times.converter != 0) {
        let d = site.toNumber($scope.task.time_period)*$scope.task.times.converter;
        let st = $scope.task.startup_date;
       
        $scope.task.deadline_date = new Date(st.getFullYear(), st.getMonth(), st.getDate() + d); 
        
      }
    }, 500);


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
      
      
    
    }, 1000);
  };


  $scope.application_request = function (task) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tasks/application_request",
      data: task
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getTaskList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.acceptToTask = function (data,user) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tasks/accept_to_task",
      data: {data:data,user:user}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#taskAssignModal');
          $scope.getTaskList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

});