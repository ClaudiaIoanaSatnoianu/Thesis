"use strict"
const express    = require("express")
const google     = require("googleapis")
const fs         = require('fs')
const bodyParser = require("body-parser")
const util       = require("util")
const Sequelize  = require("sequelize")
const cors       = require("cors")
const sequelize  = new Sequelize("licentadatabase", "root", "1234")
const bcrypt     = require("bcryptjs")
const sessions     = require("client-sessions")

const appAdministrator = express();

var dayDisplay = function(time) {
    time = new Date(time);
    time.setMinutes(time.getMinutes() + parseInt(time.getTimezoneOffset()));
    time = time.getFullYear() + "-" + ("0" + (time.getMonth()+1)).slice(-2) + "-" + ("0" + time.getDate()).slice(-2);
    return time;
}

var dayDisplay2 = function(time) {
    time = new Date(time);
    time.setMinutes(time.getMinutes() + parseInt(time.getTimezoneOffset()));
    time = ("0" + time.getDate()).slice(-2) + "-" + ("0" + (time.getMonth()+1)).slice(-2) + "-" + time.getFullYear();
    return time;
}

var hourDisplay = function(time) {
    time = new Date(time);
    time.setMinutes(time.getMinutes() + parseInt(time.getTimezoneOffset()));
    time = ("0" + time.getHours()).slice(-2) + ":" +
           ("0" + time.getMinutes()).slice(-2);
    return time;
}

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

appAdministrator.use(bodyParser.json())
appAdministrator.use(cors())
appAdministrator.use(bodyParser.urlencoded({
    extended: true
}))
appAdministrator.use(express.static(__dirname + "/frontend/administrator"))
appAdministrator.use(sessions({
    cookieName: "session",
    secret: "gyjbfhshyfgbaffdubkhfxvbnuytrdvadyfafadfjdddqq",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}))

//Declaring the tables' structure

var Specialization = sequelize.define("specialization", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    code: {
        type: Sequelize.STRING,
        allowNull:false,
        unique: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }
})

var Batch = sequelize.define("batch", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    specialization_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

var Group = sequelize.define("group", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    batch_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

var Professor = sequelize.define("professor", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey:true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    father_first_letter: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone_number: {
        type: Sequelize.STRING,
        allowNull:false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull:false
    },
    ble_device: {
        type: Sequelize.STRING,
        allowNull:true
    }
})

var Student = sequelize.define("student", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey:true
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    last_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    father_first_letter: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone_number: {
        type: Sequelize.STRING,
        allowNull:false,
        unique: true
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull:false
    },
    group_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

var Schedule = sequelize.define("schedule", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    start_time: {
        type: Sequelize.DATE,
        allowNull: false
    },
    end_time: {
        type: Sequelize.DATE,
        allowNull: false
    },
    room: {
        type: Sequelize.STRING,
        allowNull: false
    },
    subject: {
        type: Sequelize.STRING,
        allowNull:false
    },
    professor_id: {
        type: Sequelize.INTEGER,
        allowNull:false
    },
    target_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        allowNull:false
    },
    source: {
        type: Sequelize.STRING,
        allowNull:false
    }
})

var Attendance = sequelize.define("attendance", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    student_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

var Evaluation = sequelize.define("evaluation", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    question: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

var Answer = sequelize.define("answer", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    evaluation_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    answer: {
        type: Sequelize.STRING,
        allowNull: false
    },
    student_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    grade: {
        type: Sequelize.STRING,
        allowNull: true
    }
})

Specialization.hasMany(Batch, { foreignKey: 'specialization_id' })
Batch.belongsTo(Specialization, { foreignKey: 'specialization_id' })

Batch.hasMany(Group, { foreignKey: 'batch_id' })
Group.belongsTo(Batch, { foreignKey: 'batch_id' })

Group.hasMany(Student, { foreignKey: 'group_id' })
Student.belongsTo(Group, { foreignKey: 'group_id' })

Professor.hasMany(Schedule, { foreignKey: 'professor_id' }, {onDelete: 'CASCADE', hooks: true})
Schedule.belongsTo(Professor, { foreignKey: 'professor_id' })

Group.hasMany(Schedule, { foreignKey: 'target_id' })
Schedule.belongsTo(Group, { foreignKey: 'target_id' })

Batch.hasMany(Schedule, { foreignKey: 'target_id' })
Schedule.belongsTo(Batch, { foreignKey: 'target_id' })

Student.hasMany(Attendance, { foreignKey: 'student_id' }, {onDelete: 'CASCADE', hooks: true})
Attendance.belongsTo(Student, { foreignKey: 'student_id' })

Schedule.hasMany(Attendance, { foreignKey: 'schedule_id' }, {onDelete: 'CASCADE', hooks: true})
Attendance.belongsTo(Schedule, { foreignKey: 'schedule_id' })

Schedule.hasMany(Evaluation, { foreignKey: 'schedule_id' }, {onDelete: 'CASCADE', hooks: true})
Evaluation.belongsTo(Schedule, { foreignKey: 'schedule_id' })

Evaluation.hasMany(Answer, { foreignKey: 'evaluation_id' }, {onDelete: 'CASCADE', hooks: true})
Answer.belongsTo(Evaluation, { foreignKey: 'evaluation_id' })

Student.hasMany(Answer, { foreignKey: 'student_id' }, {onDelete: 'CASCADE', hooks: true})
Answer.belongsTo(Student, { foreignKey: 'student_id' })


appAdministrator.get("/create", function(req, res){
    sequelize
        .sync({
            force: true
        })
        .then(function() {
            console.log("The tables were created")
            res.status(200).send("succes")
        })
        .catch(function(error) {
            console.warn(error)
        })
})


appAdministrator.get("/specializations", function(req, res) {
    Specialization
        .findAll()
        .then(function(specializations) {
            res.status(200).send(specializations)
        })
        .catch(function(error) {
            console.log(error)
        })
})

appAdministrator.post("/specializations", function(req, res) {
    var specialiation = req.body
    Specialization
        .create(specialiation)
        .then(function() {
            res.status(201).send("Added")
        })
        .catch(function(error) {
            res.status(400).send(error.message)
        })
})

appAdministrator.delete("/specializations/:id", function(req, res) {
    Batch
        .count({
            where: {
                specialization_id: req.params.id
            }
        })
        .then( function(response) {
            if(response==0) {
                Specialization
                 .find({
                 where: {
                 id: req.params.id
                 }
                 })
                 .then(function(specialization) {
                 return specialization.destroy()
                 })
                 .then(function() {
                 res.status(201).send("removed")
                 })
                 .catch(function(error) {
                 console.warn(error)
                 res.status(500).send("error")
                 })
            } else {
                res.status(201).send("Not allowed")
            }
        })
})

appAdministrator.get("/editSpecialization/:id", function(req, res) {
    Specialization
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(specialization) {
            res.status(200).send(specialization)
        })
        .catch(function(error) {
            console.warn(error)
            res.status(500).send("error")
        })

})

appAdministrator.put("/editSpecialization/:id", function(req, res) {
    Specialization
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(specialization) {
            var newSpecialization = req.body
            return specialization.updateAttributes(newSpecialization)
        })
        .then(function() {
            res.status(201).send("updated")
        })
        .catch(function(error) {
            console.log(error.message)
            res.status(400).send(error.message)
        })
})


appAdministrator.get("/batches", function(req, res) {
    Batch
        .findAll({
            include: [ Specialization ]
        })
        .then(function(batches) {
            res.status(200).send(batches)
        })
        .catch(function(error) {
            console.log(error)
        })
})

appAdministrator.post("/batches", function(req, res) {
    var batch = req.body
    var exists = 0;
    Batch
        .count({
            where: {
                name: batch.name,
                specialization_id: batch.specialization_id,
                year: batch.year
            }
        })
        .then(function(response) {
            exists = response
            if(exists==0) {
                Batch
                    .create(batch)
                    .then(function() {
                        res.status(201).send("Added!")
                    })
                    .catch(function(error) {
                        console.log(error.message)
                    })
            } else {
                res.status(400).send("Validation error")
            }
        })
})

appAdministrator.delete("/batches/:id", function(req, res) {
    Group
        .count({
            where: {
                batch_id: req.params.id
            }
        })
        .then( function(response) {
            if(response==0) {
                Batch
                    .find({
                        where: {
                            id: req.params.id
                        }
                    })
                    .then(function(batch) {
                        return batch.destroy()
                    })
                    .then(function() {
                        res.status(201).send("removed")
                    })
                    .catch(function(error) {
                        console.warn(error)
                        res.status(500).send("error")
                    })
            } else {
                res.status(201).send("Not allowed")
            }
        })
})

appAdministrator.get("/editBatch/:id", function(req, res) {
    Batch
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(batch) {
            res.status(200).send(batch)
        })
        .catch(function(error) {
            console.warn(error)
            res.status(500).send("error")
        })
})

appAdministrator.put("/editBatch/:id", function(req, res) {
    var batch = req.body
    Batch
        .count({
            where: {
                name: batch.name,
                specialization_id: batch.specialization_id,
                year: batch.year
            }
        })
        .then(function(response) {
            if(response==0) {
                Batch
                    .find({
                        where: {
                            id: req.params.id
                        }
                    })
                    .then(function(batch) {
                        return batch.updateAttributes(req.body)
                    })
                    .then(function() {
                        res.status(201).send("updated")
                    })
                    .catch(function(error) {
                        console.warn(error)
                        res.status(500).send("error")
                    })
            } else {
                res.send("Validation error")
            }
        })
})


appAdministrator.get("/groups", function(req, res) {
    Group
        .findAll({
            include: [ {
                model: Batch
            ,include: [Specialization]} ]

        })
        .then(function(groups) {
            res.status(200).send(groups)
        })
        .catch(function(error) {
            console.log(error)
        })
})

appAdministrator.post("/groups", function(req, res) {
    var group = req.body
    console.log(group)
    Group
        .create(group)
        .then(function() {
            res.status(201).send("Added!")
        })
        .catch(function(error) {
            console.log(error.message)
        })
})

appAdministrator.delete("/groups/:id", function(req, res) {
    Student
        .count({
            where: {
                group_id: req.params.id
            }
        })
        .then( function(response) {
            if(response==0) {
                Group
                    .find({
                        where: {
                            id: req.params.id
                        }
                    })
                    .then(function(group) {
                        return group.destroy()
                    })
                    .then(function() {
                        res.status(201).send("removed")
                    })
                    .catch(function(error) {
                        console.warn(error)
                        res.status(500).send("error")
                    })
            } else {
                res.status(201).send("Not allowed")
            }
        })
})

appAdministrator.get("/editGroup/:id", function(req, res) {
    Group
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(group) {
            res.status(200).send(group)
        })
        .catch(function(error) {
            console.warn(error)
            res.status(500).send("error")
        })
})

appAdministrator.put("/editGroup/:id", function(req, res) {
    var updatedGroup = req.body
    Group
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(group) {
            return group.updateAttributes(updatedGroup)
        })
        .then(function() {
            res.status(201).send("updated")
        })
        .catch(function(error) {
            console.log(error.message)
        })
})


appAdministrator.get("/professors", function(req, res){
    Professor
        .findAll()
        .then(function(professors){
            res.status(200).send(professors)
        })
        .catch(function(error) {
            console.log(error)
        })
})

appAdministrator.post("/professors", function(req, res) {
    var professor = req.body
    professor.password = bcrypt.hashSync(professor.password, bcrypt.genSaltSync(10));
    Professor
        .create(professor)
        .then(function() {
            res.status(201).send("Added!")
        })
        .catch(function(error) {
            res.status(400).send(error.message)
            console.log(error)
        })
})

appAdministrator.delete("/professors/:id", function(req, res) {
    Professor
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(professor) {
            return professor.destroy()
        })
        .then(function() {
            res.status(201).send("removed")
        })
        .catch(function(error) {
            console.warn(error)
            res.status(500).send("error")
        })
})

appAdministrator.get("/editProfessor/:id", function(req, res) {
    Professor
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(professor) {
            res.status(200).send(professor)
        })
        .catch(function(error) {
            console.warn(error)
            res.status(500).send("error")
        })
})

appAdministrator.put("/editProfessor/:id", function(req, res) {
    var professorUpdated = req.body;

    Professor
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(professor) {
            if(professor.password != professorUpdated.password) {
                professorUpdated.password = bcrypt.hashSync(professorUpdated.password, bcrypt.genSaltSync(10));
            }
            return professor.updateAttributes(professorUpdated)
        })
        .then(function() {
            res.status(201).send("updated")
        })
        .catch(function(error) {
            console.warn(error)
            res.status(500).send("error updating")
        })
})


appAdministrator.get("/students", function(req, res) {
    Student
        .findAll({
            include: [ {
                model: Group,
                include: [{
                    model: Batch,
                    include:[Specialization]
                }]} ]
        })
        .then(function(students) {
            res.status(200).send(students)
        })
        .catch(function(error) {
            console.log(error)
        })
})

appAdministrator.post("/students", function(req, res) {
    var student = req.body
    student.password = bcrypt.hashSync(student.password, bcrypt.genSaltSync(10));
    Student
        .create(student)
        .then(function() {
            res.status(201).send("Added!")
        })
        .catch(function(error) {
            res.status(400).send(error.message)
            console.log(error)
        })
})

appAdministrator.delete("/students/:id", function(req, res) {
    Student
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(student) {
            return student.destroy()
        })
        .then(function() {
            Attendance
                .destroy({
                    where: {
                        student_id: req.params.id
                    }
                })
                .then(function () {
                    res.status(201).send("removed")
                })
                .catch(function(error) {
                    console.warn(error)
                    res.status(500).send("error")
                })
        })
        .catch(function(error) {
            console.warn(error)
            res.status(500).send("error")
        })
})

appAdministrator.get("/editStudent/:id", function(req, res) {
    Student
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(student) {
            res.status(200).send(student)
        })
        .catch(function(error) {
            console.warn(error)
            res.status(500).send("error")
        })

})

appAdministrator.put("/editStudent/:id", function(req, res) {
    var studentUpdated = req.body;

    Student
        .find({
            where: {
                id: req.params.id
            }
        })
        .then(function(student) {
            if(student.password != studentUpdated.password) {
                studentUpdated.password = bcrypt.hashSync(studentUpdated.password, bcrypt.genSaltSync(10));
            }
            return student.updateAttributes(studentUpdated)
        })
        .then(function() {
            res.status(201).send("updated")
        })
        .catch(function(error) {
            console.warn(error)
            res.status(500).send("error")
        })
})


appAdministrator.get("/student/:email/:password", function (req, res){
    var input = new Object();
    input.email = req.params.email;
    input.password = req.params.password;
    Student
        .find({
            where: {
                email: input.email
            },
            include: [
                {model: Group,
                    include: {
                        model: Batch,
                        include: [Specialization]}}]
        })
        .then(function(student) {
            if(student==null) {
                res.json(null);
            } else if(!bcrypt.compareSync(input.password, student.password)) {
                console.log(input.password)
                console.log(student.password)
                res.json(null);
            } else {
                var sendObject = new Object();
                sendObject.id = student.id;
                sendObject.last_name = student.last_name;
                sendObject.first_name = student.first_name;
                sendObject.email = student.email;
                sendObject.group_id = student.group_id;
                sendObject.group_name = student.group.name;
                sendObject.batch_id = student.group.batch.id;
                sendObject.batch_name = student.group.batch.name;
                sendObject.year = student.group.batch.year;
                req.session.student = sendObject;
                res.json(sendObject);
            }
        })
        .catch(function(error) {
            console.log(error)
        })
})

appAdministrator.get("/schedule/:group_id/:time/:batch_id", function(req, res) {
    if(req.session && req.session.student) {
        var schedule = [];
        Schedule
            .findAll({
                where: {
                    $or: [{
                        type: "seminar",
                        target_id: req.params.group_id
                    }, {
                        type: "curs",
                        target_id: req.params.batch_id
                    }],
                    start_time: {$gte: req.params.time}
                },
                order: [
                    "start_time"
                ],
                include: [
                    Professor
                ]
            })
            .then(function(response) {
                var object;
                for(var i=0;i<response.length;i++) {
                    object = new Object();
                    object.id = response[i].id;
                    object.professor_id = response[i].professor_id;
                    object.professor_name = response[i].professor.name;
                    object.subject = response[i].subject;
                    object.type = response[i].type;
                    object.day = dayDisplay(response[i].start_time);
                    object.starts = hourDisplay(response[i].start_time);
                    object.ends = hourDisplay(response[i].end_time);
                    object.room = response[i].room;
                    schedule.push(object)
                }
                res.json(schedule);
            })
            .catch(function (error) {
                res.json(schedule);
                console.log(error.message)
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.get("/present/schedule/:group_id/:time/:batch_id", function(req, res) {
    if(req.session && req.session.student) {
        var schedule = [];
        Schedule
            .findAll({
                where: {
                    $or: [{
                        type: "seminar",
                        target_id: req.params.group_id
                    }, {
                        type: "curs",
                        target_id: req.params.batch_id
                    }],
                    $and: [
                        {
                            start_time: {$lte: req.params.time}
                        },
                        {
                            end_time: {$gte: req.params.time}
                        }
                    ]
                },
                order: [
                    "start_time"
                ],
                include: [
                    Professor
                ]
            })
            .then(function(response) {
                var object;
                for(var i=0;i<response.length;i++) {
                    object = new Object();
                    object.id = response[i].id;
                    object.professor_id = response[i].professor_id;
                    object.professor_name = response[i].professor.name;
                    object.subject = response[i].subject;
                    object.type = response[i].type;
                    object.day = dayDisplay(response[i].start_time);
                    object.starts = hourDisplay(response[i].start_time);
                    object.ends = hourDisplay(response[i].end_time);
                    object.room = response[i].room;
                    schedule.push(object)
                }
                res.json(schedule);
            })
            .catch(function (error) {
                res.json(schedule);
                console.log(error.message)
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.get("/present/evaluations/:student_id/:group_id/:batch_id/:time", function(req, res) {
    if(req.session && req.session.student) {
        Evaluation
            .findAll({
                include: [{
                    model: Schedule,
                    where: {
                        $or: [{
                            type: "seminar",
                            target_id: req.params.group_id
                        }, {
                            type: "curs",
                            target_id: req.params.batch_id
                        }],
                        $and: [
                            {
                                start_time: {$lte: req.params.time}
                            },
                            {
                                end_time: {$gte: req.params.time}
                            }
                        ]
                    },
                    include: {
                        model: Attendance,
                        where: {
                            student_id: req.params.student_id
                        }
                    }
                }, {
                    model: Answer
                }]
            })
            .then(function(response) {
                var object;
                var evaluations = [];
                var found;
                for(var i=0; i<response.length;i++) {
                    found = false;
                    for(var j=0;j<response[i].answers.length;j++) {
                        if(response[i].answers[j].student_id == req.params.student_id||response[i].schedule.attendance.length==0) {
                            found = true;
                        }
                    }
                    if(found == false) {
                        object = new Object();
                        object.id = response[i].id;
                        object.question = response[i].question;
                        object.type = response[i].schedule.type;
                        object.subject = response[i].schedule.subject;
                        object.grade = 0;
                        object.answer = "";
                        evaluations.push(object);
                    }
                }
                res.json(evaluations);
            })
            .catch(function (error) {
                res.json(schedule);
                console.log(error.message)
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.get("/ble/device/:id", function(req, res) {
    if(req.session && req.session.student) {
        Professor
            .find({
                where: {
                    id: req.params.id
                }
            })
            .then(function (professor) {
                res.json(professor.ble_device);
            })
            .catch(function (error) {
                console.log(error.message);
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.get("/grades/:id", function(req, res) {
    if(req.session && req.session.student) {
        Answer
            .findAll({
                where: {
                    student_id: req.params.id,
                    grade: {$ne: null}
                },
                include: {
                    model:Evaluation,
                    include: {
                        model: Schedule
                    }
                }
            })
            .then(function (response) {
                var grades = [];
                var object;
                for(var i=0;i<response.length;i++) {
                    object = new Object();
                    object.id = 0;
                    object.question = response[i].evaluation.question;
                    object.type = response[i].evaluation.schedule.type;
                    object.subject = response[i].evaluation.schedule.subject;
                    object.grade = response[i].grade;
                    object.answer = response[i].answer;
                    grades.push(object);
                }
                res.send(grades);
            })
            .catch(function (error) {
                res.send("Error")
                console.log(error.message);
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.get("/attendance/exists/:student_id/:schedule_id", function(req, res) {
    if(req.session && req.session.student) {
        Attendance
            .find({
                where: {
                    student_id: req.params.student_id,
                    schedule_id: req.params.schedule_id
                }
            })
            .then(function(response){
                if(response!=null) {
                    res.json(response.id)
                } else {
                    res.json(response)
                }
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.post("/attendance/:student_id/:schedule_id", function(req,res) {
    if(req.session && req.session.student) {
        var object = new Object();
        object.student_id = req.params.student_id;
        object.schedule_id = req.params.schedule_id
        Attendance
            .create(object)
            .then(function() {
                res.status(201).send("Added!")
            })
            .catch(function(error) {
                res.send("Error")
                console.log(error.message)
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.post("/answer", function(req,res) {
    if(req.session && req.session.student) {
        var object = new Object();
        object.student_id = req.body.id;
        object.answer = req.body.evaluation_response;
        object.evaluation_id = req.body.evaluations_id;
        Answer
            .create(object)
            .then(function() {
                res.status(201).send("Added!")
            })
            .catch(function(error) {
                res.send("Error")
                console.log(error.message)
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.delete("/attendance/:id", function(req, res) {
    if(req.session && req.session.student) {
        Attendance
            .find({
                where: {
                    id: req.params.id
                }
            })
            .then(function(attendance) {
                return attendance.destroy()
            })
            .then(function() {
                res.status(201).send("removed")
            })
            .catch(function(error) {
                console.warn(error.message)
                res.send("error")
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.get("/attendance/report/:id", function(req, res) {
    if(req.session && req.session.student) {
        var attendance = [];
        Attendance
            .findAll({
                where: {
                    student_id: req.params.id
                },
                include: {
                    model: Schedule,
                    include: [Professor]}
            })
            .then(function(response) {
                var object;
                for(var i=0;i<response.length;i++) {
                    object = new Object();
                    object.id = response[i].schedule.id;
                    object.professor_id = response[i].schedule.professor_id;
                    object.professor_name = response[i].schedule.professor.name;
                    object.subject = response[i].schedule.subject;
                    object.type = response[i].schedule.type;
                    object.day = dayDisplay(response[i].schedule.start_time);
                    object.starts = hourDisplay(response[i].schedule.start_time);
                    object.ends = hourDisplay(response[i].schedule.end_time);
                    object.room = response[i].schedule.room;
                    attendance.push(object)
                }
                res.json(attendance);
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.put("/password", function (req, res) {
    if(req.session && req.session.student) {
        var input = new Object();
        input.student_id = req.body.student_id;
        input.old_password = req.body.old_password;
        input.new_password = req.body.new_password;

        Student
            .find({
                where: {
                    id: input.student_id
                }
            })
            .then(function(student) {
                if(student==null) {
                    res.send("wrong")
                } else if(!bcrypt.compareSync(input.old_password, student.password)) {
                    res.send("wrong")
                } else {
                    res.send("succes")
                    return student.updateAttributes({password: bcrypt.hashSync(input.new_password, bcrypt.genSaltSync(10))})
                }
            })
            .catch(function(error) {
                res.send("error")
                console.log(error.message)
            })
    } else {
        res.json("session expired")
    }
})

appAdministrator.listen(8080)
console.log("Server (administrator) is running on port 8080...")


const OAuth2 = google.auth.OAuth2;
const CLIENT_ID = "157976784156-a3bqnsmj0rekns83nfenj1cou7sgqvv0.apps.googleusercontent.com";
const CLIENT_SECRET = "nryM7h9JNDck7xC5I03dkMc3";
const REDIRECT = "http://localhost:9090/googleCalendarAccess";

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT);

const scopes = [
    "https://www.googleapis.com/auth/calendar.readonly"
];

const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
});

const appClient = express();
appClient.use(bodyParser.json())
appClient.use(cors())
appClient.use(bodyParser.urlencoded({
    extended: true
}))

appClient.use(express.static(__dirname + "/frontend/client"))

appClient.use(sessions({
    cookieName: "session",
    secret: "gyjbfhshyfgbafubkhfvugjbhjdgbshfuodcrfxvbnuytrdvadyfafadfjqqq",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}))

appClient.get("/url", function (req, res) {
    res.status(200).send(url);
})

appClient.get("/token", function(req, res) {

    var code = req.query.code;
    oauth2Client.getToken(code, function (err, tokens) {
        if(err) {
            console.log(err);
            res.send(err);
            return;
        }

        oauth2Client.setCredentials(tokens);
        res.send(tokens);

    })
})

appClient.get("/events", function(req, res) {
    var calendar = google.calendar('v3');

    calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        if (err) {
            res.send("Import events error");
            return;
        }
        var events = response.items;
        res.status(200).send(events);
    });
})

appClient.get("/logout", function(req,res) {
    if(req.session && req.session.professor) {
        req.session.reset();
    }
})

appClient.post("/login", function(req,res) {
    var input = req.body
    Professor
        .find({
            where: {
                email: input.email
            }
        })
        .then(function(professor) {
            if(professor==null) {
                res.status(200).send("NO EMAIL");
            } else if(!bcrypt.compareSync(input.password, professor.password)) {
                res.status(200).send("NO PASSWORD");
            } else {
                req.session.professor = professor
                res.status(200).send(professor)
            }
        })
        .catch(function (error) {
            console.log(error)
        })
})

appClient.get("/batches", function(req, res) {
    if(req.session && req.session.professor) {
        Batch
            .findAll({
                include: [ Specialization ]
            })
            .then(function(batches) {
                res.status(200).send(batches)
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/groups", function(req, res) {
    if(req.session && req.session.professor) {
        Group
            .findAll({
                include: [ {
                    model: Batch
                    ,include: [Specialization]} ]

            })
            .then(function(groups) {
                res.status(200).send(groups)
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/schedule/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .findAll({
                where: {
                    professor_id: req.params.id,
                    $or: [
                        {'$type$' : "seminar"},
                        {'$type$' : "curs"}
                    ]
                },
                include: [
                    {model: Group
                        ,include: {
                        model: Batch
                        ,include: [Specialization]},
                        required: false

                    }, {
                        model: Batch
                        ,include: [Specialization],
                        required: false
                    }],
                order: [
                    "start_time"
                ]
            })
            .then(function(schedule) {
                var response = [];
                var object;
                for(var i=0; i<schedule.length; i++) {
                    object = new Object();
                    object.id = schedule[i].id;
                    object.type = schedule[i].type;
                    object.subject = schedule[i].subject;
                    object.start_time = schedule[i].start_time;
                    object.end_time = schedule[i].end_time;
                    object.room = schedule[i].room;
                    object.group = "";
                    if(schedule[i].type=="seminar") {
                        object.target_id = schedule[i].target_id;
                        object.group = schedule[i].group.name;
                        object.batch = schedule[i].group.batch.name;
                        object.year = schedule[i].group.batch.year;
                        object.specialization = schedule[i].group.batch.specialization.name;
                    } else {
                        object.target_id = schedule[i].target_id;
                        object.group = "";
                        object.batch = schedule[i].batch.name;
                        object.year = schedule[i].batch.year;
                        object.specialization = schedule[i].batch.specialization.name;
                    }
                    response.push(object)
                }
                res.status(200).send(response)
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/schedule/title/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .find({
                where: {
                    id: req.params.id,
                    $or: [
                        {'$type$' : "seminar"},
                        {'$type$' : "curs"}
                    ]
                },
                include: [
                    {model: Group
                        ,include: {
                        model: Batch
                        ,include: [Specialization]},
                        required: false

                    }, {
                        model: Batch
                        ,include: [Specialization],
                        required: false
                    }],
                order: [
                    "start_time"
                ]
            })
            .then(function(schedule) {
                var object;
                object = new Object();
                object.id = schedule.id;
                object.type = schedule.type;
                object.subject = schedule.subject;
                object.start_time = schedule.start_time;
                object.end_time = schedule.end_time;
                object.room = schedule.room;
                object.group = "";
                if(schedule.type=="seminar") {
                    object.target_id = schedule.target_id;
                    object.group = schedule.group.name;
                    object.batch = schedule.group.batch.name;
                    object.year = schedule.group.batch.year;
                    object.specialization = schedule.group.batch.specialization.name;
                } else {
                    object.target_id = schedule.target_id;
                    object.group = "";
                    object.batch = schedule.batch.name;
                    object.year = schedule.batch.year;
                    object.specialization = schedule.batch.specialization.name;
                }
                res.status(200).send(object)
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/dates/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .find({
                where: {
                    id: req.params.id
                }
            })
            .then(function(schedule) {
                Schedule
                    .findAll({
                        where: {
                            type: schedule.type,
                            subject: schedule.subject,
                            target_id: schedule.target_id
                        },
                        order: [ "start_time" ]
                    })
                    .then(function(response) {
                        var dates = [];
                        for(var i=0; i<response.length; i++) {
                            dates.push(dayDisplay2(response[i].start_time));
                        }
                        res.send(dates);
                    })
                    .catch(function(error) {
                        console.log(error.message);
                    })
            })
            .catch(function(error) {
                console.log(error.message);
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/group/schedule/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .findAll({
                where: {
                    professor_id: req.params.id,
                    $or: [
                        {'$type$' : "seminar"},
                        {'$type$' : "curs"}
                    ]
                },
                include: [
                    {model: Group
                        ,include: {
                        model: Batch
                        ,include: [Specialization]},
                        required: false

                    }, {
                        model: Batch
                        ,include: [Specialization],
                        required: false
                    }],
                order: [
                    ["start_time","DESC"]
                ]
            })
            .then(function(schedule) {
                var response = [];
                var object;
                var found;
                for(var i=0; i<schedule.length; i++) {
                    object = new Object();
                    found=false;
                    object.id = schedule[i].id;
                    object.type = schedule[i].type;
                    object.subject = schedule[i].subject;
                    object.start_time = schedule[i].start_time;
                    object.end_time = schedule[i].end_time;
                    object.room = schedule[i].room;
                    object.group = "";
                    if(schedule[i].type=="seminar") {
                        object.target_id = schedule[i].target_id;
                        object.group = schedule[i].group.name;
                        object.batch = schedule[i].group.batch.name;
                        object.year = schedule[i].group.batch.year;
                        object.specialization = schedule[i].group.batch.specialization.name;
                    } else {
                        object.target_id = schedule[i].target_id;
                        object.group = "";
                        object.batch = schedule[i].batch.name;
                        object.year = schedule[i].batch.year;
                        object.specialization = schedule[i].batch.specialization.name;
                    }
                    if(response.length!=0) {
                        for(var j=0;j<response.length;j++) {
                            if((object.type==response[j].type)&&(object.subject==response[j].subject)&&(object.target_id==response[j].target_id)) {
                                found=true;
                            }
                        }
                    }
                    if(found==false) {
                        response.push(object)
                    }
                }
                res.status(200).send(response)
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/attendance/:id", function(req, res) {
    if(req.session && req.session.professor) {
        var schedule_ids = [];
        var attendance_list = [];

        Schedule
            .find({
                where: {
                    id: req.params.id,
                }
            })
            .then(function(schedule) {
                Schedule
                    .findAll({
                        where: {
                            type: schedule.type,
                            subject: schedule.subject,
                            target_id: schedule.target_id,
                            professor_id: schedule.professor_id
                        },
                        order: ["start_time"]
                    })
                    .then(function(schedules) {
                        var objectToBeSent = new Object();
                        objectToBeSent.schedule = schedules;
                        for(var a=0; a<schedules.length; a++) {
                            schedule_ids.push(schedules[a].id);
                        }
                        if(schedule.type=="curs") {
                            Attendance
                                .findAll()
                                .then(function(attendances) {
                                    attendance_list = attendances;
                                    Student
                                        .findAll({
                                            include: [{model: Group
                                                ,include: {
                                                    model: Batch}}],
                                            order: ["last_name"]
                                        })
                                        .then(function(response) {
                                            var students = [];
                                            for(var i=0; i<response.length; i++) {
                                                if(response[i].group.batch.id==schedule.target_id) {
                                                    students.push(response[i])
                                                }
                                            }
                                            var attendance = [];
                                            var student;
                                            var student_attendance;
                                            var found;
                                            var att_id;
                                            var total;
                                            var pair;
                                            for(var s=0; s<students.length; s++) {
                                                student = new Object();
                                                student_attendance = [];
                                                student.studentAttendance = [];
                                                student.student_id = students[s].id;
                                                student.name = students[s].last_name + " " + students[s].father_first_letter + " " + students[s].first_name;
                                                total = 0;
                                                for(var b=0; b<schedule_ids.length; b++) {
                                                    found=false;
                                                    for(var d=0; d<attendance_list.length; d++) {
                                                        if((attendance_list[d].student_id==students[s].id)&&
                                                            (attendance_list[d].schedule_id==schedule_ids[b])) {
                                                            found=true;
                                                            att_id = attendance_list[d].id;
                                                            total = total+1;
                                                        }
                                                    }
                                                    pair = new Object();
                                                    if(found==true)  {
                                                        pair.string = "P";
                                                        pair.id = att_id;
                                                    } else {
                                                        pair.string = "-";
                                                        pair.id = "";
                                                    }
                                                    student_attendance.push(pair);
                                                }
                                                pair = new Object();
                                                pair.string = total + "/" + schedule_ids.length;
                                                pair.id = "";
                                                student_attendance.push(pair)
                                                student.studentAttendance = student_attendance;
                                                attendance.push(student);
                                            }
                                            objectToBeSent.attendance = attendance;
                                            res.send(objectToBeSent)
                                        })
                                        .catch(function(error) {
                                            console.log(error.message);
                                        })
                                })
                        } else if(schedule.type=="seminar") {
                            Attendance
                                .findAll()
                                .then(function(attendances) {
                                    attendance_list = attendances;
                                    Student
                                        .findAll({
                                            where: {
                                                group_id: schedule.target_id
                                            },
                                            order: ["last_name"]
                                        })
                                        .then(function(students) {
                                            var attendance = [];
                                            var student;
                                            var student_attendance;
                                            var found;
                                            var total;
                                            var pair;
                                            var att_id;
                                            for(var s=0; s<students.length; s++) {
                                                student = new Object();
                                                student_attendance = [];
                                                student.student_id = students[s].id;
                                                student.name = students[s].last_name + " " + students[s].father_first_letter + " " + students[s].first_name;
                                                total = 0;
                                                for(var b=0; b<schedule_ids.length; b++) {
                                                    found=false;
                                                    for(var d=0; d<attendance_list.length; d++) {
                                                        if((attendance_list[d].student_id==students[s].id)&&
                                                            (attendance_list[d].schedule_id==schedule_ids[b])) {
                                                            found=true;
                                                            att_id = attendance_list[d].id;
                                                            total = total+1;
                                                        }
                                                    }
                                                    pair = new Object();
                                                    if(found==true)  {
                                                        pair.string = "P";
                                                        pair.id = att_id;
                                                    } else {
                                                        pair.string = "-";
                                                        pair.id = "";
                                                    }
                                                    student_attendance.push(pair);
                                                }
                                                pair = new Object();
                                                pair.string = total + "/" + schedule_ids.length;
                                                pair.id = "";
                                                student_attendance.push(pair)
                                                student.studentAttendance = student_attendance;
                                                student.attendance_ids = attendance_list;
                                                attendance.push(student);
                                            }
                                            objectToBeSent.attendance = attendance;
                                            res.send(objectToBeSent)
                                        })
                                        .catch(function(error) {
                                            console.log(error.message);
                                        })
                                })
                        }
                    })
                    .catch(function(error){
                        console.log(error.message);
                    })

            })
            .catch(function(error) {
                console.log(error.message);
            })
    } else {
        res.send("session expired")
    }
})

appClient.post("/attendance/:student_id/:schedule_id", function(req,res) {
    if(req.session && req.session.professor) {
        var object = new Object();
        object.student_id = req.params.student_id;
        object.schedule_id = req.params.schedule_id
        Attendance
            .create(object)
            .then(function() {
                res.status(201).send("Added!")
            })
            .catch(function(error) {
                res.send("Error")
                console.log(error.message)
            })
    } else {
        res.send("session expired")
    }
})

appClient.delete("/attendance/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Attendance
            .find({
                where: {
                    id: req.params.id
                }
            })
            .then(function(attendance) {
                return attendance.destroy()
            })
            .then(function() {
                res.status(201).send("removed")
            })
            .catch(function(error) {
                console.warn(error.message)
                res.send("error")
            })
    } else {
        res.send("session expired")
    }
})

appClient.delete("/event/:id", function (req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .find({
                where: {
                    id: req.params.id
                }
            })
            .then(function(schedule) {
                res.status(201).send("Activitatea a fost stearsa cu succes");
                return schedule.destroy();
            })
            .catch(function(error) {
                console.log(error.message);
            })
    } else {
        res.send("session expired")
    }
})

appClient.delete("/events/:id", function (req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .find({
                where: {
                    id: req.params.id
                }
            })
            .then(function(schedule) {
                Schedule
                    .findAll({
                        where: {
                            professor_id: schedule.professor_id,
                            subject: schedule.subject,
                            type: schedule.type,
                            target_id: schedule.target_id,
                            start_time: {$gte: schedule.start_time}
                        }
                    })
                    .then(function (events) {
                        for(var i=0;i<events.length;i++) {
                            events[i].destroy();
                        }
                        res.status(200).send("Succes")
                    })
                    .catch(function(error) {
                        console.log(error.message);
                    })
            })
            .catch(function(error) {
                console.log(error.message);
            })
    } else {
        res.send("session expired")
    }
})

appClient.post("/manualSchedule", function(req,res) {
    if(req.session && req.session.professor) {
        Schedule
            .bulkCreate(req.body)
            .then(function() {
                res.status(200).send("Succes")
            })
            .catch(function(error){
                console.log(error.message)
                res.status(400)
            })
    } else {
        res.send("session expired")
    }
})

appClient.post("/schedule/:id", function(req, res) {
    if(req.session && req.session.professor) {
        var current_date = timeZoneChange(new Date());
        Schedule
            .destroy({
                where: {
                    professor_id: req.params.id,
                    start_time: {$gte: current_date},
                    source: "auto"
                }})
            .then(function() {
                Schedule
                    .bulkCreate(req.body)
                    .then(function() {
                        res.status(200).send("Succes")
                    })
                    .catch(function(error){
                        console.log(error.message)
                        res.status(400)
                    })
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/event/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .find({
                where: {
                    id: req.params.id,
                    $or: [
                        {'$type$' : "seminar"},
                        {'$type$' : "curs"}
                    ]
                },
                include: [
                    {model: Group
                        ,include: {
                        model: Batch
                        ,include: [Specialization]},
                        required: false

                    }, {
                        model: Batch
                        ,include: [Specialization],
                        required: false
                    }]
            })
            .then(function(response) {
                res.status(200).send(response)
            })
            .catch(function(error) {
                console.log(error.message)
            })
    } else {
        res.send("session expired")
    }
})

appClient.put("/event/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .find({
                where: {
                    id: req.params.id
                }
            })
            .then(function(schedule) {
                var newAttributes = req.body
                schedule.updateAttributes(newAttributes)
            })
            .then(function() {
                res.status(201).send("updated")
            })
            .catch(function(error) {
                console.log(error.message)
            })
    } else {
        res.send("session expired")
    }
})

appClient.put("/events/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .find({
                where: {
                    id: req.params.id
                }
            })
            .then(function(schedule) {
                Schedule
                    .findAll({
                        where: {
                            professor_id: schedule.professor_id,
                            subject: schedule.subject,
                            type: schedule.type,
                            target_id: schedule.target_id,
                            start_time: {$gte: schedule.start_time}
                        }
                    })
                    .then(function (events) {
                        for(var i=0;i<events.length;i++) {
                            var newAttributes = req.body
                            events[i].updateAttributes(newAttributes)
                        }
                        res.status(200).send("Succes")
                    })
                    .catch(function(error) {
                        console.log(error.message);
                    })
            })
            .then(function() {
            })
            .catch(function(error) {
                console.log(error.message)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/evaluations/:professor_id", function(req, res) {
    if(req.session && req.session.professor) {
        Evaluation
            .findAll({
                where: {
                    $or: [
                        {'$type$' : "seminar"},
                        {'$type$' : "curs"}
                    ]
                },
                include: {
                    model: Schedule,
                    include: [
                        {model: Group
                            ,include: {
                            model: Batch
                            ,include: [Specialization]},
                            required: false

                        }, {
                            model: Batch
                            ,include: [Specialization],
                            required: false
                        }, {
                            model: Professor,
                            where: {
                                id: req.params.professor_id
                            }
                        }],

                },
                order: [
                    [Schedule, "start_time", "DESC"]
                ]
            })
            .then(function(evaluations) {
                res.send(evaluations)
            })
            .catch(function (error) {
                console.log(error.message)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/present/schedule/:professor_id/:time", function(req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .findAll({
                where: {
                    $or: [
                        {'$type$' : "seminar"},
                        {'$type$' : "curs"}
                    ],
                    professor_id: req.params.professor_id,
                    $and: [
                        {
                            start_time: {$lte: req.params.time}
                        },
                        {
                            end_time: {$gte: req.params.time}
                        }
                    ]
                },
                order: [
                    "start_time"
                ],
                include: [
                    {model: Group
                        ,include: {
                        model: Batch
                        ,include: [Specialization]},
                        required: false

                    }, {
                        model: Batch
                        ,include: [Specialization],
                        required: false
                    }, {
                        model: Professor,
                        where: {
                            id: req.params.professor_id
                        }
                    }]
            })
            .then(function(response) {
                res.json(response);
            })
            .catch(function (error) {
                res.json(schedule);
                console.log(error.message)
            })
    } else {
        res.send("session expired")
    }
})

appClient.post("/evaluation", function(req, res) {
    if(req.session && req.session.professor) {
        Evaluation
            .create(req.body)
            .then(function() {
                res.send("Added!")
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/evaluation/title/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Evaluation
            .find({
                where: {
                    id: req.params.id,
                    $or: [
                        {'$type$' : "seminar"},
                        {'$type$' : "curs"}
                    ]
                },
                include: {
                    model: Schedule,
                    include: [
                        {model: Group
                            ,include: {
                            model: Batch
                            ,include: [Specialization]},
                            required: false

                        }, {
                            model: Batch
                            ,include: [Specialization],
                            required: false
                        }]
                }
            })
            .then(function(evaluation) {
                var object;
                object = new Object();
                object.id = evaluation.schedule.id;
                object.type = evaluation.schedule.type;
                object.subject = evaluation.schedule.subject;
                object.start_time = evaluation.schedule.start_time;
                object.end_time = evaluation.schedule.end_time;
                object.room = evaluation.schedule.room;
                object.group = "";
                if(evaluation.schedule.type=="seminar") {
                    object.target_id = evaluation.schedule.target_id;
                    object.group = evaluation.schedule.group.name;
                    object.batch = evaluation.schedule.group.batch.name;
                    object.year = evaluation.schedule.group.batch.year;
                    object.specialization = evaluation.schedule.group.batch.specialization.name;
                } else {
                    object.target_id = evaluation.schedule.target_id;
                    object.group = "";
                    object.batch = evaluation.schedule.batch.name;
                    object.year = evaluation.schedule.batch.year;
                    object.specialization = evaluation.schedule.batch.specialization.name;
                }
                res.status(200).send(object)
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/evaluation/question/:id", function(req, res) {
    if(req.session && req.session.professor) {
        Evaluation
            .find({
                where: {
                    id: req.params.id,

                }
            })
            .then(function(evaluation) {
                res.status(200).send(evaluation.question)
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.send("session expired")
    }
})

appClient.get("/answers/:schedule_id/:evaluation_id", function(req, res) {
    if(req.session && req.session.professor) {
        Schedule
            .find({
                where: {
                    id: req.params.schedule_id
                }
            })
            .then(function (response)  {
                if(response.type=="curs") {
                    Student
                        .findAll({
                            include: [{
                                model: Answer,
                                where: {
                                    evaluation_id: req.params.evaluation_id
                                },
                                required: false}, {
                                model: Group,
                                include: {
                                    model:Batch,
                                    where: {
                                        id: response.target_id
                                    }
                                }
                            }
                            ]
                        })
                        .then(function(students) {
                            res.send(students)
                        })
                } else {
                    Student
                        .findAll({
                            where: {
                                group_id: response.target_id
                            },
                            include: {
                                model: Answer,
                                where: {
                                    evaluation_id: req.params.evaluation_id
                                },
                                required: false
                            }
                        })
                        .then(function(students) {
                            res.send(students)
                        })
                }
            })
    } else {
        res.send("session expired")
    }
})

appClient.put("/grade/:answer_id", function(req, res) {
    if(req.session && req.session.professor) {
        var grade = req.body;
        Answer
            .find({
                where: {
                    id: req.params.answer_id
                }
            })
            .then(function(response) {
                res.send("graded")
                return response.updateAttributes(grade);
            })
            .catch(function(error) {
                console.log(error.message);
            })
    } else {
        res.send("session expired")
    }
})

appClient.put("/password", function (req, res) {
    if(req.session && req.session.professor) {
        Evaluation
            .find({
                where: {
                    id: req.params.id,

                }
            })
            .then(function(evaluation) {
                res.status(200).send(evaluation.question)
            })
            .catch(function(error) {
                console.log(error)
            })
    } else {
        res.send("session expired")
    }
    var input = new Object();
    input.professor_id = req.body.professor_id;
    input.old_password = req.body.old_password;
    input.new_password = req.body.new_password;
    Professor
        .find({
            where: {
                id: input.professor_id
            }
        })
        .then(function(professor) {
            if(professor==null) {
                res.send("wrong")
            } else if(!bcrypt.compareSync(input.old_password, professor.password)) {
                res.send("wrong")
            } else {
                res.send("succes")
                return professor.updateAttributes({password: bcrypt.hashSync(input.new_password, bcrypt.genSaltSync(10))})
            }
        })
        .catch(function(error) {
            res.send("error")
            console.log(error.message)
        })

})

appClient.put("/change/beacon", function (req, res) {
    if(req.session && req.session.professor) {
        var input = new Object();
        input.ble_device = req.body.ble_device;
        input.professor_id = req.body.professor_id;

        Professor
            .find({
                where: {
                    id: input.professor_id
                }
            })
            .then(function(professor) {
                if(professor!=null) {
                    res.send("succes")
                    return professor.updateAttributes({ble_device: input.ble_device})
                }
            })
            .catch(function(error) {
                res.send("error")
                console.log(error.message)
            })
    } else {
        res.send("session expired")
    }
})

appClient.listen(9090)
console.log("Server (client) is running on port 9090...")