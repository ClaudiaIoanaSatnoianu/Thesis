var app = angular.module("clientControllers", ["ui.router", "LocalStorageModule"])

var timeZoneChange = function(time) {
    time.setMinutes(time.getMinutes() - parseInt(time.getTimezoneOffset()));
    time = time.getFullYear() + "-" +
        ("0" + (time.getMonth()+1)).slice(-2) + "-" +
        ("0" + time.getDate()).slice(-2) + " " +
        ("0" + time.getHours()).slice(-2) + ":" +
        ("0" + time.getMinutes()).slice(-2) + ":" +
        ("0" + time.getSeconds()).slice(-2);
    return time;
}

var timeZoneChangeDisplay = function(time) {
    time = new Date(time);
    time.setMinutes(time.getMinutes() + parseInt(time.getTimezoneOffset()));
    time = time.getFullYear() + "-" +
        ("0" + (time.getMonth()+1)).slice(-2) + "-" +
        ("0" + time.getDate()).slice(-2) + " " +
        ("0" + time.getHours()).slice(-2) + ":" +
        ("0" + time.getMinutes()).slice(-2) + ":" +
        ("0" + time.getSeconds()).slice(-2);
    return time;
}

var onlyDateDisplay = function(time) {
    time = new Date(time);
    time.setMinutes(time.getMinutes() + parseInt(time.getTimezoneOffset()));
    time = time.getFullYear() + "-" +
        ("0" + (time.getMonth()+1)).slice(-2) + "-" +
        ("0" + time.getDate()).slice(-2);
    return time;
}

var addDaysDateFormat = function(time, period) {
    time.setDate(time.getDate() + parseInt(period))
    time.setMinutes(time.getMinutes() - parseInt(time.getTimezoneOffset()));
    time = time.getFullYear() + "-" +
        ("0" + (time.getMonth() + 1)).slice(-2) + "-" +
        ("0" + time.getDate()).slice(-2) + " " +
        ("0" + time.getHours()).slice(-2) + ":" +
        ("0" + time.getMinutes()).slice(-2) + ":" +
        ("0" + time.getSeconds()).slice(-2);
    return time;
}

var addDaysDateFormatUpdate = function(time, period) {
    time.setDate(time.getDate() + parseInt(period))
    time = time.getFullYear() + "-" +
        ("0" + (time.getMonth() + 1)).slice(-2) + "-" +
        ("0" + time.getDate()).slice(-2) + " " +
        ("0" + time.getHours()).slice(-2) + ":" +
        ("0" + time.getMinutes()).slice(-2) + ":" +
        ("0" + time.getSeconds()).slice(-2);
    return time;
}

app.controller("loginController", function ($scope, $http, $state) {

    $scope.init = function() {
        $http
            .get("/logout")
            .then({})
            .catch({})
    }

    $scope.logIn = function(input) {
        if(input==undefined) {
            $scope.login = new Object();
            $scope.login.__request = {
                error: true,
                message: "Ambele campuri sunt obligatorii"
            }
        } else {
            if(input.email==undefined) {
                $scope.login = new Object();
                $scope.login.__request = {
                    error: true,
                    message: "Formatul email-ului nu este corespunzator"
                }
            } else {
                $http
                    .post("/login", input)
                    .then(function(response) {
                        if(response.data=="NO EMAIL") {
                            $scope.login = new Object();
                            $scope.login.__request = {
                                error: true,
                                message: "Email gresit"
                            }
                        } else if(response.data=="NO PASSWORD") {
                            $scope.login = new Object();
                            $scope.login.__request = {
                                error: true,
                                message: "Parola gresita"
                            }
                        } else {
                            console.log(response.data)
                            $state.go("schedule", {myParam: response.data})
                        }
                    })
                    .catch(function() {
                        $scope.login = new Object();
                        $scope.login.__request = {
                            error: true,
                            message: "Eroare de server"
                        }
                    })
            }
        }
    }

})


app.controller("scheduleController", function ($scope, $http, $state, $stateParams, $window, localStorageService) {

    var professor;
    var url = null;
    var openedAllowCalendarAccessWindow;
    var batches;
    var groups;

    if($stateParams.myParam==null) {
        professor = localStorageService.get('professor');
    } else {
        professor = $stateParams.myParam
    }

    $scope.init = function() {
        $http
            .get("/schedule/" + professor.id)
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    for(var i=0; i<response.data.length;i++) {
                        response.data[i].start_time = timeZoneChangeDisplay(response.data[i].start_time);
                        response.data[i].end_time = timeZoneChangeDisplay(response.data[i].end_time);

                    }
                    $scope.schedule = response.data;
                }
            })
            .catch(function () {

            })

        $http
            .get("/url")
            .then(function(response) {
                url = response.data
            })
            .catch(function () {

            })

        $http
            .get("/batches")
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    batches = response.data;
                }
            })
            .catch(function () {

            })

        $http
            .get("/groups")
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    groups = response.data;
                }
            })
            .catch(function () {

            })

        $scope.professor = professor
        localStorageService.set('professor',professor);
    }

    $scope.logOut = function () {
        $state.go("login")
        localStorageService.clearAll();
    }

    $scope.attendance = function () {
        $state.go("attendance",{myParam: $stateParams.myParam})
    }

    $scope.evaluation = function () {
        $state.go("evaluations",{myParam: $stateParams.myParam})
    }

    $scope.settings = function () {
        $state.go("settings",{myParam: $stateParams.myParam})
    }

    $scope.googleCalendarLogin = function() {
        if(url!=null) {
            openedAllowCalendarAccessWindow = $window.open(url, "Permiteti accesul la Google Calendar")
        }
    }

    window.onmessage = function(response) {
        openedAllowCalendarAccessWindow.close();
        var urlWithCode = response.data;
        var index = urlWithCode.lastIndexOf("code")
        var code = urlWithCode.substring(index+5).replace("#","")
        $http
            .get("/token?code="+ code)
            .then(function(response) {
                var directImport = [];
                var changeBeforeImport = [];
                $http
                    .get("/events")
                    .then(function(response) {
                        var object;
                        for(var i=0; i<response.data.length; i++) {
                            object = new Object;
                            object.start_time = "";
                            object.end_time = "";
                            object.subject = "";
                            object.type = "";
                            object.professor_id = $scope.professor.id;
                            object.target_id = "";
                            object.room = "";
                            object.source = "auto";
                            var title = response.data[i].summary.split(" ");
                            var type = title[0].toLowerCase();
                            if(type=="seminar" || type=="curs") {
                                if(title.length>1) {
                                    var subject="";
                                    for(var j=1; j<title.length; j++) {
                                        subject = subject + title[j] + " "
                                    }
                                    subject = subject.slice(0,-1)

                                    object.type = type;
                                    object.subject = subject;

                                    var start = new Date(response.data[i].start.dateTime.substring(0,response.data[i].start.dateTime.indexOf("+")).replace("T"," "))
                                    var end = new Date(response.data[i].end.dateTime.substring(0,response.data[i].start.dateTime.indexOf("+")).replace("T"," "))

                                    start = timeZoneChange(start);
                                    end = timeZoneChange(end);

                                    object.start_time = start;
                                    object.end_time = end;

                                    if(response.data[i].description!=undefined) {
                                        var content = response.data[i].description;
                                        if(content.substring(content.length-1,content.length)==";") {
                                            content = content.substring(0,content.length-1)
                                        }
                                        content = content.replace("\n","")
                                        var description = content.split(";")
                                        for(var index=0; index<description.length; index++) {
                                            if(description[index].toLowerCase().indexOf("sala:")!= -1) {
                                                if(description[index].substring(
                                                        description[index].toLowerCase().indexOf("sala:")+5,
                                                        description[index].toLowerCase().indexOf("sala:")+6==" ")){
                                                    object.room = description[index].substring(
                                                        description[index].toLowerCase().indexOf("sala:")+6,
                                                        description[index].length);
                                                } else {
                                                    object.room = description[index].substring(
                                                        description[index].toLowerCase().indexOf("sala:")+5,
                                                        description[index].length);
                                                }
                                            }
                                            if(type=="seminar") {
                                                if(description[index].toLowerCase().indexOf("grupa:")!= -1) {
                                                    var target;
                                                    if(description[index].substring(
                                                            description[index].toLowerCase().indexOf("grupa:")+6,
                                                            description[index].toLowerCase().indexOf("grupa:")+7==" ")){
                                                        target = description[index].substring(
                                                            description[index].toLowerCase().indexOf("grupa:")+7,
                                                            description[index].length);
                                                    } else {
                                                        target = description[index].substring(
                                                            description[index].toLowerCase().indexOf("grupa:")+6,
                                                            description[index].length);
                                                    }
                                                    if(groups.length>0) {
                                                        for(var gr=0;gr<groups.length;gr++) {
                                                            if(target!=undefined&&target==groups[gr].name) {
                                                                object.target_id = groups[gr].id;
                                                            }
                                                        }
                                                    }
                                                }
                                            } else {
                                                if(description[index].toLowerCase().indexOf("serie:")!= -1) {
                                                    var target = "";
                                                    var year = "";
                                                    var specialization = "";
                                                    if(description[index].substring(
                                                            description[index].toLowerCase().indexOf("serie:")+6,
                                                            description[index].toLowerCase().indexOf("serie:")+7==" ")){
                                                        target = description[index].substring(
                                                            description[index].toLowerCase().indexOf("serie:")+7,
                                                            description[index].length);
                                                    } else {
                                                        target = description[index].substring(
                                                            description[index].toLowerCase().indexOf("serie:")+6,
                                                            description[index].length);
                                                    }
                                                }

                                                if(description[index].toLowerCase().indexOf("an:")!= -1) {
                                                    if(description[index].substring(
                                                            description[index].toLowerCase().indexOf("an:")+3,
                                                            description[index].toLowerCase().indexOf("an:")+4==" ")){
                                                        year = description[index].substring(
                                                            description[index].toLowerCase().indexOf("an:")+4,
                                                            description[index].length);
                                                    } else {
                                                        year = description[index].substring(
                                                            description[index].toLowerCase().indexOf("an:")+3,
                                                            description[index].length);
                                                    }
                                                }

                                                if(description[index].toLowerCase().indexOf("specializare:")!= -1) {
                                                    if(description[index].substring(
                                                            description[index].toLowerCase().indexOf("specializare:")+13,
                                                            description[index].toLowerCase().indexOf("specializare:")+14==" ")){
                                                        specialization = description[index].substring(
                                                            description[index].toLowerCase().indexOf("specializare:")+14,
                                                            description[index].length);
                                                    } else {
                                                        specialization = description[index].substring(
                                                            description[index].toLowerCase().indexOf("specializare:")+13,
                                                            description[index].length);
                                                    }
                                                }

                                                if(batches.length>0) {
                                                    for(var bc=0;bc<batches.length;bc++) {
                                                        if(target!=undefined&&year!=undefined&&specialization!=undefined&&
                                                            target.toLowerCase()==batches[bc].name.toLowerCase()&&
                                                            year.toString().toLowerCase()==batches[bc].year.toString().toLowerCase()&&
                                                            specialization.toLowerCase()==batches[bc].specialization.name.toLowerCase()) {
                                                            object.target_id = batches[bc].id;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    var current_date = timeZoneChange(new Date());
                                    if(object.type==""||object.subject==""||object.start_time==""||
                                        object.end_time==""||object.room==""||object.target_id==""|| object.start_time < current_date) {
                                        changeBeforeImport.push(object)
                                    } else {
                                        directImport.push(object)
                                    }
                                }
                            }
                        }
                    })
                    .then(function() {
                            var jsonDirectImport = JSON.stringify(directImport);
                            $http
                                .post("/schedule/" + professor.id, jsonDirectImport)
                                .then(function(response) {
                                    if(response.data=="session expired") {
                                        $state.go("login")
                                    }
                                })
                                .then(function() {
                                    $state.go($state.current, {}, {
                                        reload: true
                                    })
                                })
                                .catch(function(){})
                    })
                    .catch(function(error){
                        console.log(error)
                    })
            })
            .catch(function(){})
    }
    
    $scope.changeTarget = function (type) {
        var targets = [];
        var target;
        if(type=="seminar") {
            $http
                .get("/groups")
                .then(function(response) {
                    if(response.data=="session expired") {
                        $state.go("login")
                    } else {
                        for(var i=0; i<response.data.length; i++) {
                            target = new Object();
                            target.id = response.data[i].id;
                            target.content = response.data[i].name + " (serie: " + response.data[i].batch.name + ", an: " +
                                response.data[i].batch.year + ", specializare: " + response.data[i].batch.specialization.name + ")";
                            targets.push(target);
                        }
                        $scope.targets = targets;
                    }
                })
                .catch(function(){})
        } else if(type=="curs") {
            $http
                .get("/batches")
                .then(function(response) {
                    if(response.data=="session expired") {
                        $state.go("login")
                    } else {
                        for(var i=0; i<response.data.length; i++) {
                            target = new Object();
                            target.id = response.data[i].id;
                            target.content = response.data[i].name + " (an: " + response.data[i].year +
                                ", specializare: " + response.data[i].specialization.name + ")";
                            targets.push(target);
                        }
                        $scope.targets = targets;
                    }
                })
                .catch(function(){})
        }
    }

    $scope.addEvent = function(event) {
        var events = [];
        if(event==undefined) {
            $scope.schedule = new Object()
            $scope.schedule.__request = {
                error: true,
                message: "TIP este un camp obligatoriu."
            }
        } else {
            if(event.subject==undefined || event.subject=="") {
                $scope.schedule = new Object()
                $scope.schedule.__request = {
                    error: true,
                    message: "MATERIE este un camp obligatoriu."
                }
            } else {
                if(event.room==undefined || event.room=="") {
                    $scope.schedule = new Object()
                    $scope.schedule.__request = {
                        error: true,
                        message: "SALA este un camp obligatoriu."
                    }
                } else {
                    if(event.target_id==undefined) {
                        $scope.schedule = new Object()
                        $scope.schedule.__request = {
                            error: true,
                            message: "SERIE/GRUPA este un camp obligatoriu."
                        }
                    } else {
                        if(event.start_time==undefined) {
                            $scope.schedule = new Object()
                            $scope.schedule.__request = {
                                error: true,
                                message: "DATA INCEPUT este un camp obligatoriu."
                            }
                        } else {
                            if(event.end_time==undefined) {
                                $scope.schedule = new Object()
                                $scope.schedule.__request = {
                                    error: true,
                                    message: "DATA SFARSIT este un camp obligatoriu."
                                }
                            } else {
                                if(event.start_time>event.end_time) {
                                    $scope.schedule = new Object()
                                    $scope.schedule.__request = {
                                        error: true,
                                        message: "DATA SFARSIT nu poate fi mai mica decat DATA INCEPUT."
                                    }
                                } else {
                                    if(event.repeats==undefined || event.repeats=="") {
                                        $scope.schedule = new Object()
                                        $scope.schedule.__request = {
                                            error: true,
                                            message: "NUMAR REPETARI este un camp obligatoriu."
                                        }
                                    } else {
                                        if (isNaN(event.repeats)) {
                                            $scope.schedule.__request = {
                                                error: true,
                                                message: "NUMAR REPETARI trebuie sa fie un numar intreg."
                                            }
                                            event.repeats.value = ""
                                        } else {
                                            if(event.period==undefined&&event.repeats!=1) {
                                                $scope.schedule = new Object()
                                                $scope.schedule.__request = {
                                                    error: true,
                                                    message: "PERIOADA este un camp obligatoriu."
                                                }
                                            } else {
                                                var object;
                                                var start;
                                                var end;
                                                event.source = "manual"
                                                event.professor_id = $scope.professor.id

                                                for(var i=0; i<event.repeats; i++) {
                                                    object = new Object();
                                                    object.type = event.type;
                                                    object.subject = event.subject;
                                                    object.professor_id = event.professor_id;
                                                    object.room = event.room;
                                                    object.target_id = event.target_id;
                                                    start = new Date(event.start_time);
                                                    end = new Date(event.end_time);
                                                    if(event.period=="weekly") {
                                                        object.start_time = addDaysDateFormat(start, i*7);
                                                        object.end_time = addDaysDateFormat(end, i*7);
                                                    } else if(event.period=="twoweeks"){
                                                        object.start_time = addDaysDateFormat(start, i*14);
                                                        object.end_time = addDaysDateFormat(end, i*14);
                                                    } else {
                                                        object.start_time = addDaysDateFormat(start, i*28);
                                                        object.end_time = addDaysDateFormat(end, i*28);
                                                    }
                                                    object.source = event.source;
                                                    events.push(object)
                                                }
                                                var jsonEvents = JSON.stringify(events);

                                                $http.post("/manualSchedule", jsonEvents)
                                                    .then(function (response) {
                                                        if(response.data=="session expired") {
                                                            $state.go("login")
                                                        } else {
                                                            $state.go($state.current, {}, {
                                                                reload: true
                                                            })
                                                        }
                                                    })
                                                    .catch(function () {
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

    $scope.deleteEvent = function(event) {
        var current_date = new Date();
        if(current_date>new Date(event.start_time)) {
            alert("Aceasta activitate nu poate fi stearsa deoarece are data de inceput in trecut.")
        } else {
             $http
             .delete("/event/" + event.id)
             .then(function(response) {
                 if(response.data=="session expired") {
                     $state.go("login")
                 } else {
                     $state.go($state.current, {}, {
                         reload: true
                     })
                 }
             })
             .catch(function(){})
        }
    }

    $scope.deleteEvents = function(event) {
        var current_date = new Date();
        if(current_date>new Date(event.start_time)) {
            alert("Aceasta activitate nu poate fi stearsa deoarece are data de inceput in trecut.")
        } else {
            $http
                .delete("/events/" + event.id)
                .then(function(response) {
                    if(response.data=="session expired") {
                        $state.go("login")
                    } else {
                        $state.go($state.current, {}, {
                            reload: true
                        })
                    }
                })
                .catch(function(){})
        }
    }

    $scope.editEvent = function(event, type) {
        var current_date = new Date();
        if(current_date>new Date(event.start_time)) {
            alert("Aceasta activitate nu poate fi stearsa deoarece are data de inceput in trecut.")
        } else {
            $state.go("editSchedule", {
                id: event.id,
                type: type
            })
        }
    }

})

app.controller("editScheduleController", function ($scope, $http, $state, $stateParams, localStorageService) {

    var professor;

    if($stateParams.myParam==null) {
        professor = localStorageService.get('professor');
    } else {
        professor = $stateParams.myParam
    }
    $scope.init = function() {

        $scope.professor = professor
        localStorageService.set('professor',professor);

        $http
            .get("/event/" + $stateParams.id)
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    response.data.start_time = timeZoneChangeDisplay(response.data.start_time);
                    response.data.end_time = timeZoneChangeDisplay(response.data.end_time);
                    $scope.event = response.data;
                }
            })
            .catch(function() {

            })

        if($stateParams.type=="one") {
            $scope.title = "Modificare eveniment ales"
        } else {
            $scope.title = "Modificare eveniment ales si evenimente urmatoare care fac parte din aceeasi serie"
        }
    }

    $scope.logOut = function () {
        $state.go("login")
        localStorageService.clearAll();
    }

    $scope.attendance = function () {
        $state.go("attendance",{myParam: $stateParams.myParam})
    }

    $scope.evaluation = function () {
        $state.go("evaluations",{myParam: $stateParams.myParam})
    }

    $scope.settings = function () {
        $state.go("settings",{myParam: $stateParams.myParam})
    }

    $scope.schedule = function () {
        $state.go("schedule",{myParam: $stateParams.myParam})
    }

    $scope.hide = function() {
        if($stateParams.type=="one") {
            document.getElementById("hideMe").style.visibility = "hidden";
        }
    }

    $scope.save = function(newEvent) {
        if(newEvent==undefined) {
            $scope.cancelEditSchedule();
        } else {
            if($stateParams.type=="one") {
                var object = new Object;
                if(newEvent.start_time!=undefined) {
                    newEvent.start_time = new Date(timeZoneChange(new Date(newEvent.start_time)));
                }
                if(newEvent.end_time!=undefined) {
                    newEvent.end_time = new Date(timeZoneChange(new Date(newEvent.end_time)));
                }

                var current_date = new Date();
                if((newEvent.start_time!=undefined&&newEvent.end_time==undefined)||(newEvent.end_time!=undefined&&newEvent.start_time==undefined)) {
                    $scope.editSchedule = new Object()
                    $scope.editSchedule.__request = {
                        error: true,
                        message: "Trebuie alese si DATA INCEPUT si DATA SFARSIT."
                    }
                } else if(newEvent.start_time<current_date) {
                    $scope.editSchedule = new Object()
                    $scope.editSchedule.__request = {
                        error: true,
                        message: "DATA INCEPUT nu poate fi mai mica decat data si ora actuala."
                    }
                } else if(newEvent.start_time>newEvent.end_time) {
                    $scope.editSchedule = new Object()
                    $scope.editSchedule.__request = {
                        error: true,
                        message: "DATA INCEPUT nu poate fi mai mare decat DATA SFARSIT."
                    }
                } else if(newEvent.type!=undefined&&newEvent.target_id==undefined) {
                    $scope.editSchedule = new Object()
                    $scope.editSchedule.__request = {
                        error: true,
                        message: "SERIE/GRUPA este un camp obligatoriu."
                    }
                } else {
                    $http
                        .put("/event/" + $scope.event.id, newEvent)
                        .then(function(response) {
                            if(response.data=="session expired") {
                                $state.go("login")
                            } else {
                                $state.go("schedule")
                            }
                        })
                        .catch(function(){})
                }
            } else {

                var object = new Object;
                if(newEvent.start_time!=undefined) {
                    newEvent.start_time = new Date(timeZoneChange(new Date(newEvent.start_time)));
                }
                if(newEvent.end_time!=undefined) {
                    newEvent.end_time = new Date(timeZoneChange(new Date(newEvent.end_time)));
                }

                var current_date = new Date();
                if((newEvent.start_time!=undefined&&newEvent.end_time==undefined)||(newEvent.end_time!=undefined&&newEvent.start_time==undefined)) {
                    $scope.editSchedule = new Object()
                    $scope.editSchedule.__request = {
                        error: true,
                        message: "Trebuie alese si DATA INCEPUT si DATA SFARSIT."
                    }
                } else if(newEvent.start_time<current_date) {
                    $scope.editSchedule = new Object()
                    $scope.editSchedule.__request = {
                        error: true,
                        message: "DATA INCEPUT nu poate fi mai mica decat data si ora actuala."
                    }
                } else if(newEvent.start_time>newEvent.end_time) {
                    $scope.editSchedule = new Object()
                    $scope.editSchedule.__request = {
                        error: true,
                        message: "DATA INCEPUT nu poate fi mai mare decat DATA SFARSIT."
                    }
                } else if(newEvent.type!=undefined&&newEvent.target_id==undefined) {
                    $scope.editSchedule = new Object()
                    $scope.editSchedule.__request = {
                        error: true,
                        message: "SERIE/GRUPA este un camp obligatoriu."
                    }
                } else {
                    if(newEvent.repeats==undefined) {
                        $http
                            .put("/events/" + $scope.event.id, newEvent)
                            .then(function(response) {
                                if(response.data=="session expired") {
                                    $state.go("login")
                                } else {
                                    $state.go("schedule")
                                }
                            })
                            .catch(function(){})
                    } else {
                        if(isNaN(newEvent.repeats)) {
                            $scope.editSchedule = new Object()
                            $scope.editSchedule.__request = {
                                error: true,
                                message: "NUMAR REPETARI trebuie sa fie un numar intreg."
                            }
                        } else {
                            if(newEvent.period==undefined) {
                                $scope.editSchedule = new Object()
                                $scope.editSchedule.__request = {
                                    error: true,
                                    message: "PERIOADA este un camp obligatoriu."
                                }
                            } else {
                                $http
                                    .get("/event/" + $stateParams.id)
                                    .then(function(response) {
                                        if(response.data=="session expired") {
                                            $state.go("login")
                                        } else {var object;
                                            var events = [];
                                            if(newEvent.start_time==undefined) {
                                                for(var i=0; i<newEvent.repeats; i++) {
                                                    object = new Object();
                                                    object.professor_id = response.data.professor_id
                                                    object.source = response.data.source
                                                    if(newEvent.type!=undefined) { object.type = newEvent.type;} else {object.type = response.data.type}
                                                    if(newEvent.subject!=undefined) { object.subject = newEvent.subject;} else {object.subject = response.data.subject}
                                                    if(newEvent.room!=undefined) { object.room = newEvent.room;} else {object.room = response.data.room}
                                                    if(newEvent.target_id!=undefined) { object.target_id = newEvent.target_id;} else {object.target_id = response.data.target_id}
                                                    start = new Date(response.data.start_time);
                                                    end = new Date(response.data.end_time);
                                                    if(newEvent.period=="weekly") {
                                                        object.start_time = addDaysDateFormatUpdate(start, i*7);
                                                        object.end_time = addDaysDateFormatUpdate(end, i*7);
                                                    } else if(newEvent.period=="twoweeks"){
                                                        object.start_time = addDaysDateFormatUpdate(start, i*14);
                                                        object.end_time = addDaysDateFormatUpdate(end, i*14);
                                                    } else {
                                                        object.start_time = addDaysDateFormatUpdate(start, i*28);
                                                        object.end_time = addDaysDateFormatUpdate(end, i*28);
                                                    }
                                                    events.push(object);
                                                }
                                            } else {
                                                start = new Date(newEvent.start_time);
                                                end = new Date(newEvent.end_time);
                                                for(var i=0; i<newEvent.repeats; i++) {
                                                    object = new Object();
                                                    object.professor_id = response.data.professor_id
                                                    object.source = response.data.source
                                                    if(newEvent.type!=undefined) { object.type = newEvent.type;} else {object.type = response.data.type}
                                                    if(newEvent.subject!=undefined) { object.subject = newEvent.subject;} else {object.subject = response.data.subject}
                                                    if(newEvent.room!=undefined) { object.room = newEvent.room;} else {object.room = response.data.room}
                                                    if(newEvent.target_id!=undefined) { object.target_id = newEvent.target_id;} else {object.target_id = response.data.target_id}

                                                    if(newEvent.period=="weekly") {
                                                        object.start_time = addDaysDateFormatUpdate(start, i*7);
                                                        object.end_time = addDaysDateFormatUpdate(end, i*7);
                                                    } else if(newEvent.period=="twoweeks"){
                                                        object.start_time = addDaysDateFormatUpdate(start, i*14);
                                                        object.end_time = addDaysDateFormatUpdate(end, i*14);
                                                    } else {
                                                        object.start_time = addDaysDateFormatUpdate(start, i*28);
                                                        object.end_time = addDaysDateFormatUpdate(end, i*28);
                                                    }
                                                    events.push(object);
                                                }
                                            }

                                            $http
                                                .delete("/events/" + $stateParams.id)
                                                .then(function(response) {
                                                    if(response.data=="session expired") {
                                                        $state.go("login")
                                                    } else {
                                                        var jsonEvents = JSON.stringify(events);
                                                        $http.post("/manualSchedule", jsonEvents)
                                                            .then(function (response) {
                                                                if(response.data=="session expired") {
                                                                    $state.go("login")
                                                                } else {
                                                                    $state.go("schedule")
                                                                }
                                                            })
                                                            .catch(function () {
                                                            })
                                                    }
                                                })
                                                .catch(function(){})
                                        }
                                    })
                                    .catch(function(){})
                            }
                        }
                    }
                }
            }
        }
    }

    $scope.changeTarget = function (type) {
        var targets = [];
        var target;
        if(type=="seminar") {
            $http
                .get("/groups")
                .then(function(response) {
                    if(response.data=="session expired") {
                        $state.go("login")
                    } else {
                        for(var i=0; i<response.data.length; i++) {
                            target = new Object();
                            target.id = response.data[i].id;
                            target.content = response.data[i].name + " (serie: " + response.data[i].batch.name + ", an: " +
                                response.data[i].batch.year + ", specializare: " + response.data[i].batch.specialization.name + ")";
                            targets.push(target);
                        }
                        $scope.targets = targets;
                    }
                })
                .catch(function(){})
        } else if(type=="curs") {
            $http
                .get("/batches")
                .then(function(response) {
                    if(response.data=="session expired") {
                        $state.go("login")
                    } else {
                        for(var i=0; i<response.data.length; i++) {
                            target = new Object();
                            target.id = response.data[i].id;
                            target.content = response.data[i].name + " (an: " + response.data[i].year +
                                ", specializare: " + response.data[i].specialization.name + ")";
                            targets.push(target);
                        }
                        $scope.targets = targets;
                    }
                })
                .catch(function(){})
        }
    }

    $scope.cancelEditSchedule = function () {
        $state.go("schedule")
    }

})


app.controller("attendanceController", function ($scope, $http, $state, $stateParams, localStorageService) {

    var professor

    if($stateParams.myParam==null) {
        professor = localStorageService.get('professor');
    } else {
        professor = $stateParams.myParam
    }

    $scope.init = function() {
        $scope.professor = professor
        localStorageService.set('professor',professor);

        $http
            .get("/group/schedule/" + professor.id)
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    for(var i=0; i<response.data.length;i++) {
                        response.data[i].start_time = timeZoneChangeDisplay(response.data[i].start_time);
                        response.data[i].end_time = timeZoneChangeDisplay(response.data[i].end_time);

                    }
                    $scope.scheduleList = response.data;
                }
            })
            .catch(function () {

            })

    }

    $scope.logOut = function () {
        $state.go("login")
        localStorageService.clearAll();
    }

    $scope.schedule = function () {
        $state.go("schedule",{myParam: $stateParams.myParam})
    }

    $scope.evaluation = function () {
        $state.go("evaluations",{myParam: $stateParams.myParam})
    }

    $scope.settings = function () {
        $state.go("settings",{myParam: $stateParams.myParam})
    }

    $scope.viewAttendance = function(id) {
        $state.go("selectedAttendance", {
            id: id
        })
    }

})

app.controller("selectedAttendanceController", function ($scope, $http, $state, $stateParams, localStorageService) {

    var professor

    if($stateParams.myParam==null) {
        professor = localStorageService.get('professor');
    } else {
        professor = $stateParams.myParam
    }

    $scope.init = function() {
        $scope.professor = professor
        localStorageService.set('professor',professor);

        $http
            .get("/schedule/title/" + $stateParams.id)
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    var title = response.data;
                    if(title.type=="curs") {
                        $scope.title = title.type + " " + title.subject + " seria " + title.batch +
                            ", an " + title.year + ", specializare " + title.specialization;
                    } else if(title.type=="seminar") {
                        $scope.title = title.type + " " + title.subject + " grupa " + title.group +  ", seria " + title.batch +
                            ", an " + title.year + ", specializare " + title.specialization;
                    }
                }
            })

        $http
            .get("/dates/" + $stateParams.id)
            .then(function (response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    $scope.dates = response.data;
                }
            })
            .catch(function(error) {
                console.log(error.message)
            })

        $http
            .get("/attendance/" + $stateParams.id)
            .then(function (response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    var schedulesList = [];
                    var object;
                    for(var i=0; i<response.data.schedule.length; i++) {
                        object = new Object();
                        object.id = response.data.schedule[i].id;
                        object.date = timeZoneChangeDisplay(response.data.schedule[i].start_time);
                        schedulesList.push(object);
                    }
                    $scope.schedules = schedulesList;
                    $scope.attendances = response.data.attendance;
                }
            })
            .catch(function(error) {
                console.log(error.message)
            })
    }

    $scope.logOut = function () {
        $state.go("login")
        localStorageService.clearAll();
    }

    $scope.attendance = function () {
        $state.go("attendance",{myParam: $stateParams.myParam})
    }

    $scope.schedule = function () {
        $state.go("schedule",{myParam: $stateParams.myParam})
    }

    $scope.evaluation = function () {
        $state.go("evaluations",{myParam: $stateParams.myParam})
    }

    $scope.settings = function () {
        $state.go("settings",{myParam: $stateParams.myParam})
    }

    $scope.addAttendance = function(attendance) {
        if((attendance.student==undefined) || (attendance.schedule==undefined)) {
            $scope.attendance = new Object()
            $scope.attendance.__request = {
                error: true,
                message: "STUDENT si DATA PREZENTA sunt obligatorii."
            }
        } else {
            $http
                .post("/attendance/" + attendance.student + "/" + attendance.schedule)
                .then(function (response) {
                    if(response.data=="session expired") {
                        $state.go("login")
                    } else {
                        $state.go($state.current, {}, {
                            reload: true
                        })
                    }
                })
                .catch(function () {})
        }
    }

    $scope.deleteAttendance = function(id,string) {
        if(string=="P") {
            if (confirm("Doriti stergerea acestei prezente?") == true) {
                $http
                    .delete("/attendance/"+id)
                    .then(function(response) {
                        if(response.data=="session expired") {
                            $state.go("login")
                        } else {
                            $state.go($state.current, {}, {
                                reload: true
                            })
                        }
                    })
                    .catch(function(){})
            }
        }
    }

})


app.controller("evaluationController", function ($scope, $http, $state, $stateParams, localStorageService) {

    var professor

    if($stateParams.myParam==null) {
        professor = localStorageService.get('professor');
    } else {
        professor = $stateParams.myParam
    }

    $scope.init = function() {
        $scope.professor = professor
        localStorageService.set('professor',professor);

        $http
            .get("/evaluations/" + professor.id)
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    var evaluationsList = [];
                    var object;
                    for(var i=0;i<response.data.length;i++) {
                        object = new Object();
                        object.id = response.data[i].id;
                        object.date = onlyDateDisplay(response.data[i].schedule.start_time)
                        object.type = response.data[i].schedule.type;
                        object.subject = response.data[i].schedule.subject;
                        object.group = "";
                        if(object.type=="curs") {
                            object.batch = response.data[i].schedule.batch.name;
                            object.year = response.data[i].schedule.batch.year;
                            object.specialization = response.data[i].schedule.batch.specialization.name;
                        } else {
                            object.group = response.data[i].schedule.group.name;
                            object.batch = response.data[i].schedule.group.batch.name;
                            object.year = response.data[i].schedule.group.batch.year;
                            object.specialization = response.data[i].schedule.group.batch.specialization.name;
                        }
                        evaluationsList.push(object);
                    }
                    $scope.evaluations = evaluationsList;
                }
            })
            .catch(function(){})

        var current_date = timeZoneChange(new Date());
        $http
            .get("/present/schedule/" + professor.id + "/" + current_date)
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    var scheduleList = [];
                    var object;
                    for(var i=0;i<response.data.length;i++) {
                        object = new Object();
                        object.id = response.data[i].id;
                        object.type = response.data[i].type;
                        object.subject = response.data[i].subject;
                        object.group = "";
                        if(object.type=="curs") {
                            object.batch = response.data[i].batch.name;
                            object.year = response.data[i].batch.year;
                            object.specialization = response.data[i].batch.specialization.name;
                        } else {
                            object.group = response.data[i].group.name;
                            object.batch = response.data[i].group.batch.name;
                            object.year = response.data[i].group.batch.year;
                            object.specialization = response.data[i].group.batch.specialization.name;
                        }
                        scheduleList.push(object);
                    }
                    $scope.schedules = scheduleList;
                }
            })
            .catch(function(){})

    }

    $scope.logOut = function () {
        $state.go("login")
        localStorageService.clearAll();
    }

    $scope.schedule = function () {
        $state.go("schedule",{myParam: $stateParams.myParam})
    }

    $scope.attendance = function () {
        $state.go("attendance",{myParam: $stateParams.myParam})
    }

    $scope.settings = function () {
        $state.go("settings",{myParam: $stateParams.myParam})
    }

    $scope.startEvaluation = function(schedule_id) {
        $state.go("startEvaluation",{id: schedule_id})
    }

    $scope.viewEvaluation = function(evaluation_id) {
        $state.go("selectedEvaluation",{id: evaluation_id})
    }
})

app.controller("startEvaluationController", function ($scope, $http, $state, $stateParams, localStorageService) {

    var professor

    if($stateParams.myParam==null) {
        professor = localStorageService.get('professor');
    } else {
        professor = $stateParams.myParam
    }

    $scope.init = function() {
        $scope.professor = professor
        localStorageService.set('professor',professor);

        $http
            .get("/schedule/title/" + $stateParams.id)
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    var title = response.data;
                    if(title.type=="curs") {
                        $scope.title = title.type + " " + title.subject + " seria " + title.batch +
                            ", an " + title.year + ", specializare " + title.specialization;
                    } else if(title.type=="seminar") {
                        $scope.title = title.type + " " + title.subject + " grupa " + title.group +  ", seria " + title.batch +
                            ", an " + title.year + ", specializare " + title.specialization;
                    }
                }
            })
    }

    $scope.logOut = function () {
        $state.go("login")
        localStorageService.clearAll();
    }

    $scope.schedule = function () {
        $state.go("schedule",{myParam: $stateParams.myParam})
    }

    $scope.attendance = function () {
        $state.go("attendance",{myParam: $stateParams.myParam})
    }

    $scope.evaluation = function () {
        $state.go("evaluations",{myParam: $stateParams.myParam})
    }

    $scope.settings = function () {
        $state.go("settings",{myParam: $stateParams.myParam})
    }

    $scope.sendQuestion = function(question) {
        if(question==undefined) {
            $scope.startEvaluation = new Object()
            $scope.startEvaluation.__request = {
                error: true,
                message: "INTREBARE este un camp obligatoriu."
            }
        } else {
            var evaluation = new Object();
            evaluation.question = question;
            evaluation.schedule_id = $stateParams.id;
            $http
                .post("/evaluation", evaluation)
                .then(function(response) {
                    if(response.data=="session expired") {
                        $state.go("login")
                    } else {
                        $state.go("evaluations",{myParam: $stateParams.myParam})
                    }
                })
                .catch(function(){})
        }
    }
})

app.controller("selectedEvaluationController", function ($scope, $http, $state, $stateParams, localStorageService) {

    var professor

    if($stateParams.myParam==null) {
        professor = localStorageService.get('professor');
    } else {
        professor = $stateParams.myParam
    }

    $scope.init = function() {
        $scope.professor = professor
        localStorageService.set('professor',professor);
        var schedule_id;
        $http
            .get("/evaluation/title/" + $stateParams.id)
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    var title = response.data;
                    schedule_id = title.id
                    if(title.type=="curs") {
                        $scope.title = title.type + " " + title.subject + " seria " + title.batch +
                            ", an " + title.year + ", specializare " + title.specialization;
                    } else if(title.type=="seminar") {
                        $scope.title = title.type + " " + title.subject + " grupa " + title.group +  ", seria " + title.batch +
                            ", an " + title.year + ", specializare " + title.specialization;
                    }
                    $scope.date = timeZoneChangeDisplay(title.start_time);
                }
            })
            .then(function() {
                $http
                    .get("/answers/" + schedule_id + "/" + $stateParams.id)
                    .then(function(response) {
                        if(response.data=="session expired") {
                            $state.go("login")
                        } else {
                            var studentList = [];
                            var object;
                            for(var i=0;i<response.data.length;i++) {
                                object = new Object;
                                object.student_name = response.data[i].last_name + " " + response.data[i].father_first_letter + " " + response.data[i].first_name;
                                if(response.data[i].answers.length!=0) {
                                    object.student_answer = response.data[i].answers[0].answer;
                                    object.student_grade = response.data[i].answers[0].grade;
                                    object.answer_id = response.data[i].answers[0].id;
                                }
                                studentList.push(object)
                            }
                            $scope.students = studentList;
                        }
                    })
                    .catch(function(error){
                        console.log(error.message)
                    })
            })

        $http
            .get("/evaluation/question/" + $stateParams.id)
            .then(function(response) {
                if(response.data=="session expired") {
                    $state.go("login")
                } else {
                    $scope.question = response.data;
                }
            })
            .catch(function(){})
    }

    $scope.logOut = function () {
        $state.go("login")
        localStorageService.clearAll();
    }

    $scope.schedule = function () {
        $state.go("schedule",{myParam: $stateParams.myParam})
    }

    $scope.attendance = function () {
        $state.go("attendance",{myParam: $stateParams.myParam})
    }

    $scope.evaluation = function () {
        $state.go("evaluations",{myParam: $stateParams.myParam})
    }

    $scope.settings = function () {
        $state.go("settings",{myParam: $stateParams.myParam})
    }

    $scope.saveGrade = function(answer_id, grade) {
        var answer = new Object();
        if(answer_id!=undefined&&grade!=undefined) {
            answer.grade = grade;
           $http
               .put("/grade/" + answer_id,answer)
               .then(function(response) {
                   if(response.data=="session expired") {
                       $state.go("login")
                   }
               })
               .catch(function(){})
        }
    }

    $scope.returnToEvaluations = function() {
        $state.go("evaluations",{myParam: $stateParams.myParam})
    }

})


app.controller("settingsController", function ($scope, $http, $state, $stateParams, localStorageService) {

    var professor

    if($stateParams.myParam==null) {
        professor = localStorageService.get('professor');
    } else {
        professor = $stateParams.myParam
    }

    $scope.init = function() {
        $scope.professor = professor
        localStorageService.set('professor',professor);
    }

    $scope.logOut = function () {
        $state.go("login")
        localStorageService.clearAll();
    }

    $scope.schedule = function () {
        $state.go("schedule",{myParam: $stateParams.myParam})
    }

    $scope.attendance = function () {
        $state.go("attendance",{myParam: $stateParams.myParam})
    }

    $scope.evaluation = function () {
        $state.go("evaluations",{myParam: $stateParams.myParam})
    }

    $scope.changePassword = function(object) {
        if(object==undefined||object.old_password==undefined||object.new_password==undefined||object.retyped_new_password==undefined) {
            $scope.settings = new Object()
            $scope.settings.__request = {
                error: true,
                message: "Toate campurile sunt obligatorii."
            }
        } else {
            if(object.new_password!=object.retyped_new_password) {
                $scope.settings = new Object()
                $scope.settings.__request = {
                    error: true,
                    message: "Cele doua campuri de PAROLA NOUA nu coincid."
                }
            } else {
                var password = new Object();
                password.new_password = object.new_password;
                password.old_password = object.old_password;
                password.professor_id = professor.id;
                $http
                    .put("/password",password)
                    .then(function(response) {
                        if(response.data=="wrong") {
                            $scope.settings = new Object()
                            $scope.settings.__request = {
                                error: true,
                                message: "PAROLA VECHE gresita."
                            }
                        } else {
                            $scope.successSettings = new Object()
                            $scope.successSettings.__request = {
                                error: true,
                                message: "Parola a fost schimbata cu succes."
                            }
                            $scope.settings = new Object()
                            $scope.settings.__request = {
                                error: false
                            }
                        }
                    })
                    .catch(function(){
                        $scope.settings = new Object()
                        $scope.settings.__request = {
                            error: true,
                            message: "Eroare server."
                        }
                    })
            }
        }
    }

    $scope.changeBeacon = function(beacon) {
        if(beacon==undefined) {
            $scope.settingsBeacon = new Object()
            $scope.settingsBeacon.__request = {
                error: true,
                message: "ADRESA MAC BEACON este camp obligatoriu."
            }
        } else {
            var object = new Object();
            object.professor_id = professor.id;
            object.ble_device = beacon;
            $http
                .put("/change/beacon", object)
                .then(function(response) {
                    if(response.data=="session expired") {
                        $state.go("login")
                    } else {
                        $scope.successSettingsBeacon = new Object()
                        $scope.successSettingsBeacon.__request = {
                            error: true,
                            message: "ADRESA MAC BEACON a fost schimbata cu succes."
                        }
                    }
                })
                .catch(function() {
                })
        }
    }

})