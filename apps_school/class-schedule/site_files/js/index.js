app.controller("class_schedule", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.class_schedule = {};

  $scope.displayAddClassSchedule = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.class_schedule = {
      image_url: '/images/class_schedule.png',
      sunday: true,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      max_school_class: 0,
      active: true
    };
    site.showModal('#classScheduleAddModal');
  };

  $scope.addClassSchedule = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#classScheduleAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/class_schedule/add",
      data: $scope.class_schedule
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#classScheduleAddModal');
          $scope.getClassScheduleList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          } else if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateClassSchedule = function (class_schedule, update) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsClassSchedule(class_schedule, update);
    $scope.class_schedule = {};
    site.showModal('#classScheduleUpdateModal');
  };

  $scope.updateClassSchedule = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#classScheduleUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/class_schedule/update",
      data: $scope.class_schedule
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#classScheduleUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsClassSchedule = function (class_schedule, view) {
    $scope.error = '';
    $scope.detailsClassSchedule(class_schedule, view);

    $scope.class_schedule = {};
    site.showModal('#classScheduleDetailsModal');
  };

  $scope.detailsClassSchedule = function (class_schedule, view) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/class_schedule/view",
      data: {
        id: class_schedule.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.class_schedule = response.data.doc;
          if (view == 'update') {
            $scope.getSubjects($scope.class_schedule.school_grade)
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteClassSchedule = function (class_schedule) {
    $scope.error = '';
    $scope.detailsClassSchedule(class_schedule);
    $scope.class_schedule = {};
    site.showModal('#classScheduleDeleteModal');
  };

  $scope.deleteClassSchedule = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/class_schedule/delete",
      data: {
        id: $scope.class_schedule.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#classScheduleDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getClassScheduleList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/class_schedule/all",
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

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getClassScheduleList($scope.search);
    site.hideModal('#classScheduleSearchModal');
    $scope.search = {}

  };

  $scope.getTrainersList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/trainer/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.trainersList = response.data.list;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };
  $scope.createSchedule = function () {

    $scope.class_schedule.schedules_list = [];

    if ($scope.class_schedule.saturday) $scope.class_schedule.schedules_list.push({ day: { name: 'saturday', ar: 'السبت', en: 'Saturday' }, schedules_count_list: [] });
    if ($scope.class_schedule.sunday) $scope.class_schedule.schedules_list.push({ day: { name: 'sunday', ar: 'الأحد', en: 'Sunday' }, schedules_count_list: [] });
    if ($scope.class_schedule.monday) $scope.class_schedule.schedules_list.push({ day: { name: 'monday', ar: 'الإثنين', en: 'Monday' }, schedules_count_list: [] });
    if ($scope.class_schedule.tuesday) $scope.class_schedule.schedules_list.push({ day: { name: 'tuesday', ar: 'الثلاثاء', en: 'Tuesday' }, schedules_count_list: [] });
    if ($scope.class_schedule.wednesday) $scope.class_schedule.schedules_list.push({ day: { name: 'wednesday', ar: 'الأربعاء', en: 'Wednesday' }, schedules_count_list: [] });
    if ($scope.class_schedule.thursday) $scope.class_schedule.schedules_list.push({ day: { name: 'thursday', ar: 'الخميس', en: 'Thursday' }, schedules_count_list: [] });
    if ($scope.class_schedule.friday) $scope.class_schedule.schedules_list.push({ day: { name: 'friday', ar: 'الجمعة', en: 'Friday' }, schedules_count_list: [] });

    $scope.class_schedule.schedules_list.forEach(_sl => {
      _sl.count_school_class = $scope.class_schedule.max_school_class;
      for (let i = 0; i < $scope.class_schedule.max_school_class; i++) {
        _sl.schedules_count_list.push({});
      };
    });
  };

  $scope.getSubjects = function (c) {
    $scope.subjectsList = [];

    c.subjects_list.forEach(_s => {
      $scope.subjectsList.push({
        name: _s.subject.name,
        code: _s.subject.code,
        id: _s.subject.id
      })
    });
  };


  $scope.addClass = function (c) {
    $scope.error = '';

    let count_school_class_length = c.schedules_count_list.length + 1;

    if (count_school_class_length > $scope.class_schedule.max_school_class) {
      $scope.error = '##word.err_class_bigger##';

    } else {
      c.schedules_count_list.push({});
    }



  /*   if (c.count_school_class !== c.schedules_count_list.length) {

      c.schedules_count_list = [];

      for (let i = 0; i < c.count_school_class; i++) {

        c.schedules_count_list.push({});

      };
    } */
  };


  $scope.getSchoolGrade = function () {
    $http({
      method: "POST",
      url: "/api/school_grade/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1,
          subjects_list: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.schoolGradeList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getHalls = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.hallsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
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
        screen: "class_schedule"
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

  $scope.getNumberingAuto();
  $scope.getSchoolGrade();
  $scope.getTrainersList();
  $scope.getHalls();
  $scope.getClassScheduleList();

});