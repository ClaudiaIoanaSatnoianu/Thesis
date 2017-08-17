var app = angular.module("databaseControllers", ["ui.router"])

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

app.controller("specializationController", function($scope, $http, $state) {

    $http
        .get("/specializations")
        .then(function(response) {
            $scope.specializations = response.data
        })
        .catch(function() {
            $scope.status = "error"
        })

    $scope.addSpecialization = function(specialization) {
        var code = document.getElementById("exampleCode");
        var name = document.getElementById("exampleName");
        $scope.specialization = new Object()
        if (code.value == null || code.value == "") {
            $scope.specialization.__request = {
                error: true,
                message: "COD SPECIALIZARE este un camp obligatoriu!"
            }
        } else {
            if (name.value == null || name.value == "") {
                $scope.specialization.__request = {
                    error: true,
                    message: "DENUMIRE SPECIALIZARE este un camp obligatoriu!"
                }
            } else {
                $http
                    .post("/specializations", specialization)
                    .then(function (response) {
                        $scope.status = 'added'
                        $state.go($state.current, {}, {
                            reload: true
                        })
                    })
                    .catch(function (response) {
                        if (response.data == "Validation error") {
                            $scope.specialization.__request = {
                                error: true,
                                message: "COD si DENUMIRE SPECIALIZARE trebuie sa fie unice."
                            }
                        }
                        $scope.status = 'not added'
                    })
            }
        }
    }

    $scope.deleteSpecialization = function (id) {

        $http
            .delete("/specializations/" + id)
            .then(function (response) {
                if(response.data=="Not allowed") {
                    $scope.specialization = new Object()
                    $scope.specialization.__request = {
                        error: true,
                        message: "SPECIALIZAREA nu poate fi stearsa deoarece exista inregistrari de tipul SERIE care au ca si cheie externa id-ul acestia."
                    }
                } else {
                    $state.go($state.current, {}, {
                        reload: true
                    })
                }
            })
            .catch(function () {
                console.log('Delete Error!')
            })
    }

    $scope.editSpecialization = function (id) {
        $state.go("editSpecialization", {
            id: id
        })
    }
})

app.controller("editSpecializationController", function ($scope, $http, $state, $stateParams) {
    $scope.init = function () {
        $http
            .get("/editSpecialization/" + $stateParams.id)
            .then(function (response) {
                $scope.specialization = response.data
            })
            .catch(function () {
                $scope.status = "error"
            })
    }

    $scope.editSpecialization = function (specialization) {

        var code = document.getElementById("exampleCode");
        var name = document.getElementById("exampleName");

        if (code.value == null || code.value == "") {
            $scope.editSpecialization.__request = {
                error: true,
                message: "COD SPECIALIZARE este un camp obligatoriu!"
            }
        }
        else {
            if (name.value == null || name.value == "") {
                $scope.editSpecialization.__request = {
                    error: true,
                    message: "DENUMIRE SPECIALIZARE este un camp obligatoriu!"
                }
            }
            else {
                $http
                    .put("/editSpecialization/" + $stateParams.id, specialization)
                    .then(function (response) {
                        $state.go("specializations")
                    })
                    .catch(function (response) {
                        if (response.data == "Validation error") {
                            $scope.editSpecialization.__request = {
                                error: true,
                                message: "COD si DENUMIRE SPECIALIZARE trebuie sa fie unice."
                            }
                        }
                        $scope.status = 'not added'
                    })

            }
        }
    }

    $scope.cancelEditSpecialization = function () {
        $state.go("specializations")
    }
})


app.controller("batchController", function ($scope, $http, $state) {

    $http.get('/batches')
        .then(function (response) {
            $scope.batches = response.data
        }).catch(function () {
        $scope.status = "error"
    })

    $http.get('/specializations')
        .then(function (response) {
            $scope.specializations = response.data
        }).catch(function () {
        $scope.status = "error"
    })

    $scope.addBatch = function (batch) {

        var specialization = document.getElementById("exampleSpecialization").options[document.getElementById("exampleSpecialization").selectedIndex];
        var year = document.getElementById("exampleYear");
        var name = document.getElementById("exampleName");
        $scope.batch = new Object()

        if (specialization.value=="? undefined:undefined ?" || specialization.value == null || specialization.value == "") {
            $scope.batch.__request = {
                error: true,
                message: "SPECIALIZARE este un camp obligatoriu!"
            }
        } else {
            if (year.value == null || year.value == "") {
                $scope.batch.__request = {
                    error: true,
                    message: "AN este un camp obligatoriu!"
                }
            } else {

                if (name.value == null || name.value == "") {
                    $scope.batch.__request = {
                        error: true,
                        message: "SERIE este un camp obligatoriu!"
                    }
                }
                else {
                    if (isNaN(year.value)) {
                        $scope.batch.__request = {
                            error: true,
                            message: "AN trebuie sa fie un numar intreg!"
                        }
                        year.value = ""
                    }
                    else {
                        $http
                            .post("/batches", batch)
                            .then(function (response) {
                                $scope.status = 'added'
                                $state.go($state.current, {}, {
                                    reload: true
                                })
                            })
                            .catch(function (response) {
                                if (response.data == "Validation error") {
                                    $scope.batch.__request = {
                                        error: true,
                                        message: "Aceasta SERIE exista deja pentru anul si specializarea specificate."
                                    }
                                }
                                $scope.status = 'not added'
                            })
                    }
                }
            }
        }
    }

    $scope.deleteBatch = function (id) {
        $http.delete('/batches/' + id)
            .then(function (response) {
                if(response.data=="Not allowed") {
                    $scope.batch = new Object()
                    $scope.batch.__request = {
                        error: true,
                        message: "SERIA nu poate fi stearsa deoarece exista inregistrari de tipul GRUPA care au ca si cheie externa id-ul acestia."
                    }
                } else {
                    $state.go($state.current, {}, {
                        reload: true
                    })
                }
            })
            .catch(function () {
                console.log('Delete Error!')
            })
    }

    $scope.editBatch = function (id) {
        $state.go("editBatch", {
            id: id
        })
    }
})

app.controller("editBatchController", function ($scope, $http, $state, $stateParams) {
    $scope.init = function () {
        $http
            .get("/editBatch/" + $stateParams.id)
            .then(function (response) {
                $scope.batch = response.data
            })
            .then( function() {

                $http.get('/specializations')
                    .then(function (response) {
                        $scope.specializations = response.data
                    })
                    .catch(function () {
                        $scope.status = "error"
                    })
                }
            )
            .catch(function () {
                $scope.status = "error"
            })
    }

    $scope.editBatch = function (batch) {

        var year = document.getElementById("exampleYear");
        var name = document.getElementById("exampleName");

        if (year.value == null || year.value == "") {
            $scope.editBatch.__request = {
                error: true,
                message: "AN este un camp obligatoriu!"
            }
        }
        else {
            if (name.value == null || name.value == "") {
                $scope.editBatch.__request = {
                    error: true,
                    message: "SERIE este un camp obligatoriu!"
                }
            }
            else {
                if (isNaN(year.value)) {
                    $scope.editBatch.__request = {
                        error: true,
                        message: "AN trebuie sa fie un numar intreg!"
                    }
                    year.value = ""
                }
                else {
                    $http
                        .put("/editBatch/" + $stateParams.id, batch)
                        .then(function (response) {
                            $state.go("batches")
                        })
                        .catch(function (response) {
                            if (response.data == "Validation error") {
                                $scope.editBatch.__request = {
                                    error: true,
                                    message: "Aceasta SERIE a fost deja introdusa pentru anul si specializarea alese."
                                }
                            }
                            $scope.status = 'not added'
                        })
                }
            }
        }
    }

    $scope.cancelEditBatch = function () {
        $state.go("batches")
    }
})


app.controller("groupController", function ($scope, $http, $state) {

    $http.get('/groups')
        .then(function (response) {
            $scope.groups = response.data
        }).catch(function () {
        $scope.status = "error"
    })

    $http.get('/batches')
        .then(function (response) {
            $scope.batches = response.data
        }).catch(function () {
        $scope.status = "error"
    })

    $scope.addGroup = function (group) {

        var name = document.getElementById("exampleName");
        var batch = document.getElementById("exampleBatch").options[document.getElementById("exampleBatch").selectedIndex];

        $scope.group = new Object();

        if (name.value == null || name.value == "") {
            $scope.group.__request = {
                error: true,
                message: "GRUPA este un camp obligatoriu!"
            }
        }
        else {
            if (batch.value=="? undefined:undefined ?" || batch.value == null || batch.value == "") {
                $scope.group.__request = {
                    error: true,
                    message: "SERIE este un camp obligatoriu!"
                }
            } else {
                $http
                    .post("/groups", group)
                    .then(function (response) {
                        $scope.status = 'added'
                        $state.go($state.current, {}, {
                            reload: true
                        })
                    })
                    .catch(function (response) {
                        if (response.data == "Validation error") {
                            $scope.group.__request = {
                                error: true,
                                message: "GRUPA trebuie sa fie valoare unica."
                            }
                        }
                        $scope.status = 'not added'
                    })
            }
        }
    }

    $scope.deleteGroup = function (id) {
        $http.delete('/groups/' + id)
            .then(function (response) {
                if(response.data=="Not allowed") {
                    $scope.group = new Object()
                    $scope.group.__request = {
                        error: true,
                        message: "GRUPA nu poate fi stearsa deoarece exista inregistrari de tipul STUDENT care au ca si cheie externa id-ul acestia."
                    }
                } else {
                    $state.go($state.current, {}, {
                        reload: true
                    })
                }
            })
            .catch(function () {
                console.log('Delete Error!')
            })
    }

    $scope.editGroup = function (id) {
        $state.go("editGroup", {
            id: id
        })
    }
})

app.controller("editGroupController", function ($scope, $http, $state, $stateParams) {

    $scope.init = function() {

        var groupObject = new Object();
        $http.get('/batches')
            .then(function (response) {
                $scope.batches = response.data
            }).catch(function () {
            $scope.status = "error"
        })

        $http
            .get("/editGroup/" + $stateParams.id)
            .then(function (response) {
                $scope.group = response.data
            })
            .catch(function () {
                $scope.status = "error"
            })
    }

    $scope.editGroup = function (group) {

        var name = document.getElementById("exampleName");
        var batch = document.getElementById("exampleBatch").options[document.getElementById("exampleBatch").selectedIndex];

        $scope.group = new Object();

        if (name.value == null || name.value == "") {
            $scope.editGroup.__request = {
                error: true,
                message: "GRUPA este un camp obligatoriu!"
            }
        }
        else {
            if (batch.value=="? undefined:undefined ?" || batch.value == null || batch.value == "") {
                $scope.editGroup.__request = {
                    error: true,
                    message: "SERIE este un camp obligatoriu!"
                }
            } else {
                $http
                    .put("/editGroup/" + $stateParams.id, group)
                    .then(function (response) {
                        $state.go("groups")
                    })
                    .catch(function (response) {
                        if (response.data == "Validation error") {
                            $scope.editGroup.__request = {
                                error: true,
                                message: "GRUPA trebuie sa fie valoare unica."
                            }
                        }
                        $scope.status = 'not added'
                    })
            }
        }
    }

    $scope.cancelEditGroup = function () {
        $state.go("groups")
    }
})


app.controller("professorController", function ($scope, $http, $state) {

    $http
        .get("/professors")
        .then(function (response) {
            $scope.professors = response.data
        })
        .catch(function () {
            $scope.status = "error"
        })

    $scope.addProfessor = function (professor) {

        var id = document.getElementById('exampleId');
        var name = document.getElementById("exampleName");
        var first_letter = document.getElementById("exampleFirstLetter");
        var email = document.getElementById("exampleEmail");
        var phone_number = document.getElementById("examplePhoneNumber");
        var password = document.getElementById("examplePassword");

        if (id.value == null || id.value == "") {
            $scope.professor.__request = {
                error: true,
                message: "ID este un camp obligatoriu!"
            }
        } else {
            if (name.value == null || name.value == "") {
                $scope.professor.__request = {
                    error: true,
                    message: "NUME este un camp obligatoriu!"
                }
            }
            else {
                if (first_letter.value == null || first_letter.value == "") {
                    $scope.professor.__request = {
                        error: true,
                        message: "INITIALA PRENUME TATA este un camp obligatori!"
                    }
                }
                else {
                    if (phone_number.value == null || phone_number.value == "") {
                        $scope.professor.__request = {
                            error: true,
                            message: "NUMAR DE TELEFON este un camp obligatori!"
                        }
                    }
                    else {
                        if (email.value == null || email.value == "") {
                            $scope.professor.__request = {
                                error: true,
                                message: "Email este un camp obligatori!"
                            }
                        }
                        else {
                            if (password.value == null || password.value == "") {
                                $scope.professor.__request = {
                                    error: true,
                                    message: "PAROLA este un camp obligatori!"
                                }
                            }
                            else {
                                if (isNaN(id.value)) {
                                    $scope.professor.__request = {
                                        error: true,
                                        message: "ID trebuie sa fie un numar intreg!"
                                    }
                                    id.value = ""
                                }
                                else {
                                    if (validateEmail(email.value) == false) {
                                        $scope.professor.__request = {
                                            error: true,
                                            message: "EMAIL-ul nu este valid"
                                        }
                                        email.value = ""
                                    }
                                    else {
                                        $http
                                            .post("/professors", professor)
                                            .then(function (response) {
                                                $scope.status = 'added'
                                                $state.go($state.current, {}, {
                                                    reload: true
                                                })
                                            })
                                            .catch(function (response) {
                                                if (response.data == "Validation error") {
                                                    $scope.professor.__request = {
                                                        error: true,
                                                        message: "ID, EMAIL si NUMAR DE TELEFON trebuie sa fie unice."
                                                    }
                                                }
                                                $scope.status = 'not added'
                                            })
                                    }
                                }

                            }
                        }

                    }
                }
            }
        }


    }
    $scope.deleteProfessor = function (id) {

        $http
            .delete("/professors/" + id)
            .then(function () {
                console.log("Succes!")
                $state.go($state.current, {}, {
                    reload: true
                })
            })
            .catch(function () {
                console.log('Delete Error!')
            })
    }

    $scope.editProfessor = function (id) {
        $state.go("editProfessor", {
            id: id
        })
    }
})

app.controller("editProfessorController", function ($scope, $http, $state, $stateParams) {
    $scope.init = function () {
        $http.get("/editProfessor/" + $stateParams.id)
            .then(function (response) {
                $scope.professor = response.data

            })
            .catch(function () {
                $scope.status = "error"
            })
    }

    $scope.editProfessor = function (professor) {

        var name = document.getElementById("exampleName");
        var first_letter = document.getElementById("exampleFirstLetter");
        var email = document.getElementById("exampleEmail");
        var phone_number = document.getElementById("examplePhoneNumber");
        var password = document.getElementById("examplePassword");


        if (name.value == null || name.value == "") {
            $scope.editProfessor.__request = {
                error: true,
                message: "NUME este un camp obligatoriu!"
            }
        }
        else {
            if (first_letter.value == null || first_letter.value == "") {
                $scope.editProfessor.__request = {
                    error: true,
                    message: "INITIALA PRENUME TATA este un camp obligatoriu!"
                }
            }
            else {
                if (email.value == null || email.value == "") {
                    $scope.editProfessor.__request = {
                        error: true,
                        message: "EMAIL este un camp obligatoriu!"
                    }
                }
                else {
                    if (phone_number.value == null || phone_number.value == "") {
                        $scope.editProfessor.__request = {
                            error: true,
                            message: "NUMAR DE TELEFON este un camp obligatoriu!"
                        }
                    }
                    else {
                        if (password.value == null || password.value == "") {
                            $scope.editProfessor.__request = {
                                error: true,
                                message: "PAROLA este un camp obligatoriu!"
                            }
                        }
                        else {
                            if (validateEmail(email.value) == false) {
                                $scope.editProfessor.__request = {
                                    error: true,
                                    message: "EMAIL-ul nu are formatul corect."
                                }
                                email.value = ""
                            }
                            else {
                                $http
                                    .put("/editProfessor/" + $stateParams.id, professor)
                                    .then(function (response) {
                                        $state.go("professors")
                                    })
                                    .catch(function (error) {
                                        $scope.editProfessor.__request = {
                                            error: true,
                                            message: "ID, NUMAR DE TELEFON si EMAIL sunt atribute unice"
                                        }

                                    })
                            }
                        }

                    }

                }
            }
        }
    }

    $scope.cancelEditProfessor = function () {
        $state.go("professors")
    }
})


app.controller("studentController", function ($scope, $http, $state) {

    $http.get('/students')
        .then(function (response) {
            $scope.students = response.data
        }).catch(function () {
            $scope.status = "error"
        })

    $http.get('/groups')
        .then(function (response) {
            $scope.groups = response.data
        }).catch(function () {
        $scope.status = "error"
    })

    $scope.addStudent = function (student) {

        var id = document.getElementById("exampleId");
        var firstName = document.getElementById("exampleFirstName");
        var lastName = document.getElementById("exampleLastName");
        var firstLetter = document.getElementById("exampleFirstLetter");
        var email = document.getElementById("exampleEmail");
        var phoneNumber = document.getElementById("examplePhoneNumber");
        var password = document.getElementById("examplePassword");
        var group = document.getElementById("exampleGroup");

        $scope.student = new Object();

        if (id.value == null || id.value == "") {
            $scope.student.__request = {
                error: true,
                message: "ID este un camp obligatoriu!"
            }
        }
        else {
            if (firstName.value == null || firstName.value == "") {
                $scope.student.__request = {
                    error: true,
                    message: "NUME este un camp obligatoriu!"
                }
            }
            else {
                if (lastName.value == null || lastName.value == "") {
                    $scope.student.__request = {
                        error: true,
                        message: "PRENUME este un camp obligatoriu!"
                    }
                }
                else {
                    if (firstLetter.value == null || firstLetter.value == "") {
                        $scope.student.__request = {
                            error: true,
                            message: "INITIALA PRENUME TATA este un camp obligatoriu!"
                        }
                    }
                    else {
                        if (phoneNumber.value == null || phoneNumber.value == "") {
                            $scope.student.__request = {
                                error: true,
                                message: "NUMAR DE TELEFON este un camp obligatoriu!"
                            }
                        }
                        else {
                            if (email.value == null || email.value == "") {
                                $scope.student.__request = {
                                    error: true,
                                    message: "EMAIL este un camp obligatoriu!"
                                }
                            }
                            else {
                                if (password.value == null || password.value == "") {
                                    $scope.student.__request = {
                                        error: true,
                                        message: "PAROLA este un camp obligatoriu!"
                                    }
                                }
                                else {
                                    if (group.value=="? undefined:undefined ?" || group.value == null || group.value == "") {
                                        $scope.student.__request = {
                                            error: true,
                                            message: "GRUPA este un camp obligatoriu!"
                                        }
                                    }
                                    else {
                                        if (isNaN(id.value)) {
                                            $scope.student.__request = {
                                                error: true,
                                                message: "ID trebuie sa fie un numar intreg!"
                                            }
                                            id.value = ""
                                        }
                                        else {
                                            if (validateEmail(email.value) == false) {
                                                $scope.student.__request = {
                                                    error: true,
                                                    message: "EMAIL-ul nu este valid"
                                                }
                                                email.value = ""
                                            }
                                            else {
                                                    $http.post('/students', student)
                                                        .then(function () {
                                                            $scope.status = 'added'
                                                            $state.go($state.current, {}, {
                                                                reload: true
                                                            })
                                                        })
                                                        .catch(function (response) {
                                                            if (response.data == "Validation error") {
                                                                $scope.student.__request = {
                                                                    error: true,
                                                                    message: "ID, EMAIL si NUMAR DE TELEFON trebuie sa fie unice."
                                                                }
                                                            }
                                                            $scope.status = 'not added'
                                                        })
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    $scope.deleteStudent = function (id) {
        $http.delete('/students/' + id)
            .then(function () {
                console.log("Succes!")
                $state.go($state.current, {}, {
                    reload: true
                })
            })
            .catch(function () {
                console.log('Error!')
            })
    }

    $scope.editStudent = function (id) {
        $state.go("editStudent", {
            id: id
        })
    }
})

app.controller("editStudentController", function ($scope, $http, $state, $stateParams) {
    $scope.init = function () {

        var studentObject = new Object();

        $http.get('/groups')
            .then(function (response) {
                $scope.groups = response.data
            }).catch(function () {
            $scope.status = "error"
        })

        $http
            .get("/editStudent/" + $stateParams.id)
            .then(function (response) {
                $scope.student = response.data
            })
            .catch(function () {
                $scope.status = "error"
            })
    }

    $scope.editStudent = function (student) {

        var firstName = document.getElementById("exampleFirstName");
        var lastName = document.getElementById("exampleLastName");
        var firstLetter = document.getElementById("exampleFirstLetter");
        var email = document.getElementById("exampleEmail");
        var phoneNumber = document.getElementById("examplePhoneNumber");
        var password = document.getElementById("examplePassword");
        var group = document.getElementById("exampleGroup");


        if (firstName.value == null || firstName.value == "") {
            $scope.editStudent.__request = {
                error: true,
                message: "NUME este un camp obligatoriu!"
            }
        }
        else {
            if (lastName.value == null || lastName.value == "") {
                $scope.editStudent.__request = {
                    error: true,
                    message: "PRENUME este un camp obligatoriu!"
                }
            }
            else {
                if (firstLetter.value == null || firstLetter.value == "") {
                    $scope.editStudent.__request = {
                        error: true,
                        message: "INITIALA PRENUME TATA este un camp obligatori!"
                    }
                }
                else {
                    if (phoneNumber.value == null || phoneNumber.value == "") {
                        $scope.editStudent.__request = {
                            error: true,
                            message: "NUMAR DE TELEFON este un camp obligatori!"
                        }
                    }
                    else {
                        if (email.value == null || email.value == "") {
                            $scope.editStudent.__request = {
                                error: true,
                                message: "EMAIL este un camp obligatori!"
                            }
                        }
                        else {
                            if (password.value == null || password.value == "") {
                                $scope.editStudent.__request = {
                                    error: true,
                                    message: "PAROLA este un camp obligatori!"
                                }
                            }
                            else {
                                if (group.value=="? undefined:undefined ?" || group.value == null || group.value == "") {
                                    $scope.editStudent.__request = {
                                        error: true,
                                        message: "GRUPA este un camp obligatori!"
                                    }
                                }
                                else {
                                    if (validateEmail(email.value) == false) {
                                        $scope.editStudent.__request = {
                                            error: true,
                                            message: "EMAIL-ul nu este valid"
                                        }
                                        email.value = ""
                                    }
                                    else {
                                        student.group = group.value;
                                        $http
                                            .put("/editStudent/" + student.id, student)
                                            .then(function (response) {
                                                $state.go("students")
                                            })
                                            .catch(function (response) {
                                                if (response.data == "Validation error") {
                                                    $scope.editStudent.__request = {
                                                        error: true,
                                                        message: "NUMAR DE TELEFON si EMAIL sunt atribute unice"
                                                    }
                                                }
                                                $scope.status = 'not added'
                                            })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    $scope.cancelEditStudent = function () {
        $state.go("students")
    }
})


app.controller("createTablesController", function ($scope, $http, $state) {

    $scope.createTables = function () {

        $http
            .get("/create")
            .then(function () {
                $state.go("specializations")
            })
            .catch(function () {
                $scope.status = "error"
            })
    }

    $scope.cancelCreateTables = function () {
        $state.go("professors")
            .catch(function () {
                $scope.status = "error"
            })
    }
})