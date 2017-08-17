var app = angular.module("licentaApp",["ui.router","databaseControllers"])
app.config(function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise("/specializations")
    $stateProvider.state("specializations",{
        url:"/specializations",
        templateUrl:"html/specializations.html",
        controller:"specializationController"
    })
    $stateProvider.state("editSpecialization",{
        url:"/editSpecialization/:id",
        templateUrl:"html/edit_specialization.html",
        controller:"editSpecializationController"
    })
    $stateProvider.state("batches",{
        url:"/batches",
        templateUrl:"html/batches.html",
        controller:"batchController"
    })
    $stateProvider.state("editBatch",{
        url:"/editBatch/:id",
        templateUrl:"html/edit_batch.html",
        controller:"editBatchController"
    })
    $stateProvider.state("groups",{
        url:"/groups",
        templateUrl:"html/groups.html",
        controller:"groupController"
    })
    $stateProvider.state("editGroup",{
        url:"/editGroup/:id",
        templateUrl:"html/edit_group.html",
        controller:"editGroupController"
    })
    $stateProvider.state("professors",{
        url:"/professors",
        templateUrl:"html/professors.html",
        controller:"professorController"
    })
    $stateProvider.state("editProfessor",{
        url:"/editProfessor/:id",
        templateUrl:"html/edit_professor.html",
        controller:"editProfessorController"
    })
    $stateProvider.state("students",{
        url:"/students",
        templateUrl:"html/students.html",
        controller:"studentController"
    })
    $stateProvider.state("editStudent",{
        url:"/editStudent/:id",
        templateUrl:"html/edit_student.html",
        controller:"editStudentController"
    })
    $stateProvider.state("create",{
        url:"/create",
        templateUrl:"html/create_tables.html",
        controller:"createTablesController"
    })
})
.directive("capitalize", function() {
    return {
      require: "ngModel",
      link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue == undefined) inputValue = "";
          var capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
          }
          return capitalized;
        }
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]);
      }
    };
  });