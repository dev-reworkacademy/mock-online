let express = require('express');
let cors = require('cors');
let fs = require('fs');
let app = express();
let PORT = 8000;


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

let read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
let save = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, 4));


let user_courses = read("./user_courses.json");
let course_contents = read("./course_content.json");
let token;

let validate = (req, res, next) => {
    token =  read('./token.txt');
    let d = req.headers["authorization"]?.toString().toLowerCase().replace("bearer", "").trim();
    if (!d || d != token) return res.status(401).json({ status: "unauthorized", code: 401, msg: "You are not authorized to access this." });
    next();
}

let version = "/api/v1";

app.post(`${version}/auth/logout`,validate, (req, res) => {
    token = Date.now().toString("32");
    fs.writeFileSync("./token.txt",token)
    res.json({
        status: "ok",
        code: 200,
        msg: "Logout successfully..",
    })

})

app.post(`${version}/auth/login`, (req, res) => {
    let { email, password } = req.body;


    token = read("./token.txt");

    if (email != "devrus265@gmail.com" && password != "123456") {
        return res.json({
            status: "not_exist",
            code: 404,
            msg: "Invalid email or password"
        })
    }
    res.json({
        status: "ok",
        code: 200,
        msg: "Successfully retrieved.",
        data: {
            user: {
                id: "123",
                full_name: "Anestin James",
                email: "devrus265@gmail.com",
                avatar: ""
            },
            token
        }
    })
})

app.get(`${version}/users/me`, validate, (req, res) => {


    res.json({
        status: "ok",
        code: 200,
        msg: "Successfully retrieved student course",
        data: {
            "id":"123",
            "email":"devrus265@gmail.com",
            full_name:"Anestin James",
            "phone":"+234-934-234-3453"
        }
    });
})

app.get(`${version}/users/courses`, validate, (req, res) => {
    res.json({
        status: "ok",
        code: 200,
        msg: "Successfully retrieved student course",
        data: user_courses,
        paginate: {
            page: 1,
            pages: 1,
            limit: 10
        }
    });
})

app.get(`${version}/courses/:id/contents`, validate, (req, res) => {

    let contents = course_contents[req.params.id];
    if (!contents) return res.status(404).send({ code: 404, status: "not_found", msg: "Course does not exist." });

    res.json({
        status: "ok",
        code: 200,
        msg: "Successfully retrieved course content",
        data: {
            "objective": [
                "Use stateful authentication practices",
                "Integrate react and express application",
                "using html content to upload course content",
                "Deploy to a different postbuild script"
            ],
            "overview": {
                "rating": 4.1,
                "total_student": "7,300",
                "total_rated": "2,400",
                "total_hours": 19.3,
                "lectures": 77,
                "caption": false,
                "platform": ["IOS", "Android"],
                "has_certificate": false,
                "live_time_access": false,
                "published_date": "2024-12-10T20:55:56.439Z",
                "descp": "Lorem Ipsum is Lorem Ipsum but was Praes nost anotherworld than Lorem Ipsum in another book.",
                "intructors": [
                    {
                        name: "Anestin Jackson",
                        avatar: "https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                        "role": "Software Engineer at Rework",
                        "descp": "Lorem Ipsum, Lorem Ipsum and others have appeared in the Lorem Ipsum book (http://Lorem.Ipsum), but I have seen many other people who have appeared in the Lorem Ipsum book.",
                        "socials": {
                            "x": "https://www.x.com/anestin-json30",
                            "facebook": "https://www.facebook.com/anestin-json",
                            "linkedin": "https://www.linkedin.com/anestin_jackson",
                            "youtube": "https://www.youtube.com/anestin"
                        }
                    }
                ]
            },
            contents
        }
    });
})

app.post(`${version}/courses/mark-as-read`, validate, (req, res) => {

    let { lesson_id } = req.body;
    let info;
    for (let contents of Object.values(course_contents)) {

        for (let lesson of contents) {

            for (let i of lesson.lessons) {

                if (i.id === lesson_id) {
                    // console.log(lesson)
                    if (i.is_completed) {
                        return res.json({
                            code: 200,
                            status: "ok",
                            mes: "Marked as completed."
                        });
                    }
                    lesson.completed++
                    info = i;
                    break
                }
            }
        }
    }

    if (!info) return res.status(404).json({
        code: 404,
        status: "not_found",
        msg: "Lesson does not exist."
    });

    info.is_completed = true;
    save("./course_content.json", course_contents);

    res.json({
        code: 200,
        status: "ok",
        mes: "Marked as completed."
    });
})

app.listen(PORT, () => {
    console.log("Mock is running on port:" + PORT);
})