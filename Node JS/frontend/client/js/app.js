var app = angular.module("clientApp",["ui.router","clientControllers"])

app.config(function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise("/login")
    $stateProvider.state("login",{
        url:"/login",
        templateUrl:"html/login.html",
        controller:"loginController"
    })
    $stateProvider.state("schedule",{
        url:"/schedule",
        params: {myParam: null},
        templateUrl:"html/schedule.html",
        controller:"scheduleController"
    })
    $stateProvider.state("editSchedule",{
        url:"/edit/schedule/:id/:type",
        params: {myParam: null},
        templateUrl:"html/edit_schedule.html",
        controller:"editScheduleController"
    })
    $stateProvider.state("attendance",{
        url:"/attendance",
        params: {myParam: null},
        templateUrl:"html/attendance.html",
        controller:"attendanceController"
    })
    $stateProvider.state("selectedAttendance",{
        url:"/selected/attendance/:id",
        params: {myParam: null},
        templateUrl:"html/selected_attendance.html",
        controller:"selectedAttendanceController"
    })
    $stateProvider.state("evaluations",{
        url:"/evaluations",
        params: {myParam: null},
        templateUrl:"html/evaluation.html",
        controller:"evaluationController"
    })
    $stateProvider.state("startEvaluation",{
        url:"/start/evaluation/:id",
        params: {myParam: null},
        templateUrl:"html/start_evaluation.html",
        controller:"startEvaluationController"
    })
    $stateProvider.state("selectedEvaluation",{
        url:"/selected/evaluation/:id",
        params: {myParam: null},
        templateUrl:"html/selected_evaluation.html",
        controller:"selectedEvaluationController"
    })
    $stateProvider.state("settings",{
        url:"/settings",
        params: {myParam: null},
        templateUrl:"html/settings.html",
        controller:"settingsController"
    })
})