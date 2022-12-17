const { Db } = require('mongodb');
const connection = require('../config/mongoConnection');
const data = require('../data/');
const students = data.students;
const courses = data.courses;
const reviews = data.reviews
const comments = data.comments

const main = async () => {
    const db = await connection();
    await db.dropDatabase();

    //Seed Sample courses
    const C1 = await courses.createCourse("Introduction to JAVA Programming", "CS 501", 3, "Peter William", "peter@stevens.edu", "Sham Shah",  "sham@stevens.edu");
    const C2 = await courses.createCourse("Fundamentals of Computing", "CS 515", 3, "Robert Doe", "robert@stevens.edu", "Rolando Robert",   "rolando@stevens.edu");
    const C3 = await courses.createCourse("Computer Organization and Programming", "CS 551", 3, "Jeffer Lyons ", "jeffer@stevens.edu", "Parth Kumar",   "parth@stevens.edu");
    const C4 = await courses.createCourse("Algorithms", "CS 590", 3, "David Jukrat", "pjukrat@stevens.edu", "Tejas Jain",   "tejas@stevens.edu");
    const C5 = await courses.createCourse("Principles of Programming Languages", "CS 510", 3, "Alice Brown", "alice@stevens.edu", "Aman Malhotra",   "aman@stevens.edu");
    const C6 = await courses.createCourse("Compiler Design and Implementation", "CS 516", 3, "Mark Grrenberg", "mark@stevens.edu", "Willian Watt",   "william@stevens.edu");
    const C7 = await courses.createCourse("TCP/IP Networking", "CS 521", 3, "David Thomas",  "david@stevens.edu", "Karan Jain",  "karan@stevens.edu");
    const C8 = await courses.createCourse("Enterprise and Cloud Computing", "CS 526", 3, "Felice Smith", "felice@stevens.edu", "Joseph Witt",   "joseph@stevens.edu");
    const C9 = await courses.createCourse("Interactive Computer Graphics", "CS 537", 3, "Zun Ju", "zun@stevens.edu", "Smitha Patil",  "smitha@stevens.edu");
    const C10 = await courses.createCourse("Web Programming", "CS 546", 3, "Patrick Hill",  "patrick@stevens.edu", "Aditya Kapoor", "aditya@stevens.edu");
   
    //Seed Sample Students
    const S1 = await students.createStudents("Donald", "Brown", "donald@stevens.edu", "Donald@123");
    const S2 = await students.createStudents("Kartik", "Shah", "kartik@stevens.edu", "Kartik@123");
    const S3 = await students.createStudents("Michael", "Trump", "michael@stevens.edu", "Michael@123");
    const S4 = await students.createStudents("Sanjeev", "Bhatt", "sanjeev@stevens.edu", "Sanjeev@123");
    const S5 = await students.createStudents("Danny", "Sussan", "dann@stevens.edu", "Dann@123");
    const S6 = await students.createStudents("Miles", "Tartaglia", "miles@stevens.edu","Mile@123");
    const S7 = await students.createStudents("John", "Rosenberg", "john@stevens.edu", "John@123");
    const S8 = await students.createStudents("Jessica", "Doen", "jessica@stevens.edu", "Jessica@123");
    const S9 = await students.createStudents("Kamil", "Pelis", "kamil@stevens.edu", "Kamil@123");
    const S10 = await students.createStudents("Alice", "Smith", "alice@stevens.edu", "Alice@123");

    //Seed Sample Reviews
    const r1c1 = await reviews.createReview(String(C1._id), String(S1._id), "fall2022", 4, "Concepts are easy to understand");
    const c1r1c1 = await comments.createComment(String(S10._id), String(r1c1._id), "The course very easy to understand");
    const c2r1c1 = await comments.createComment(String(S9._id), String(r1c1._id), "Easy to understand the concepts");

    const r2c1 = await reviews.createReview(String(C1._id), String(S2._id), "fall2021", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c1 = await comments.createComment(String(S8._id), String(r2c1._id), "The course very easy to understand");
    const c2r2c1 = await comments.createComment(String(S7._id), String(r2c1._id), "Easy to understand the concepts");
    
    const r1c2 = await reviews.createReview(String(C2._id), String(S3._id), "spring2022", 4, "Concepts are easy to understand");
    const c1r1c2 = await comments.createComment(String(S6._id), String(r1c2._id), "The course very easy to understand");
    const c2r1c2 = await comments.createComment(String(S5._id), String(r1c2._id), "Easy to understand the concepts");

    const r2c2 = await reviews.createReview(String(C2._id), String(S4._id), "fall2021", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c2 = await comments.createComment(String(S3._id), String(r2c2._id), "The course very easy to understand");
    const c2r2c2 = await comments.createComment(String(S2._id), String(r2c2._id), "Easy to understand the concepts");
    
    const r1c3 = await reviews.createReview(String(C3._id), String(S5._id), "spring2022", 4, "Concepts are easy to understand");
    const c1r1c3 = await comments.createComment(String(S1._id), String(r1c3._id), "The course very easy to understand");
    const c2r1c3 = await comments.createComment(String(S2._id), String(r1c3._id), "Easy to understand the concepts");

    const r2c3 = await reviews.createReview(String(C3._id), String(S6._id), "fall2022", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c3 = await comments.createComment(String(S3._id), String(r2c3._id), "The course very easy to understand");
    const c2r2c3 = await comments.createComment(String(S4._id), String(r2c3._id), "Easy to understand the concepts");

    const r1c4 = await reviews.createReview(String(C4._id), String(S7._id), "fall2021", 4, "Concepts are easy to understand");
    const c1r1c4 = await comments.createComment(String(S5._id), String(r1c4._id), "The course very easy to understand");
    const c2r1c4 = await comments.createComment(String(S6._id), String(r1c4._id), "Easy to understand the concepts");

    const r2c4 = await reviews.createReview(String(C4._id), String(S8._id), "spring2022", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c4 = await comments.createComment(String(S7._id), String(r2c4._id), "The course very easy to understand");
    const c2r2c4 = await comments.createComment(String(S9._id), String(r2c4._id), "Easy to understand the concepts");
    
    const r1c5 = await reviews.createReview(String(C5._id), String(S8._id), "spring2022", 4, "Concepts are easy to understand");
    const c1r1c5 = await comments.createComment(String(S10._id), String(r1c5._id), "The course very easy to understand");
    const c2r1c5 = await comments.createComment(String(S1._id), String(r1c5._id), "Easy to understand the concepts");

    const r2c5 = await reviews.createReview(String(C5._id), String(S10._id), "fall2021", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c5 = await comments.createComment(String(S2._id), String(r2c5._id), "The course very easy to understand");
    const c2r2c5 = await comments.createComment(String(S3._id), String(r2c5._id), "Easy to understand the concepts");

    const r1c6 = await reviews.createReview(String(C6._id), String(S1._id), "fall2022", 4, "Concepts are easy to understand");
    const c1r1c6 = await comments.createComment(String(S10._id), String(r1c6._id), "The course very easy to understand");
    const c2r1c6 = await comments.createComment(String(S9._id), String(r1c6._id), "Easy to understand the concepts");

    const r2c6 = await reviews.createReview(String(C6._id), String(S2._id), "fall2022", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c6 = await comments.createComment(String(S8._id), String(r2c6._id), "The course very easy to understand");
    const c2r2c6 = await comments.createComment(String(S7._id), String(r2c6._id), "Easy to understand the concepts");
    
    const r1c7 = await reviews.createReview(String(C7._id), String(S3._id), "fall2021", 4, "Concepts are easy to understand");
    const c1r1c7 = await comments.createComment(String(S6._id), String(r1c7._id), "The course very easy to understand");
    const c2r1c7 = await comments.createComment(String(S5._id), String(r1c7._id), "Easy to understand the concepts");

    const r2c7 = await reviews.createReview(String(C7._id), String(S4._id), "spring2022", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c7 = await comments.createComment(String(S3._id), String(r2c7._id), "The course very easy to understand");
    const c2r2c7 = await comments.createComment(String(S2._id), String(r2c7._id), "Easy to understand the concepts");
    
    const r1c8 = await reviews.createReview(String(C8._id), String(S5._id), "fall2021", 4, "Concepts are easy to understand");
    const c1r1c8 = await comments.createComment(String(S1._id), String(r1c8._id), "The course very easy to understand");
    const c2r1c8 = await comments.createComment(String(S2._id), String(r1c8._id), "Easy to understand the concepts");

    const r2c8 = await reviews.createReview(String(C8._id), String(S6._id), "spring2022", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c8 = await comments.createComment(String(S3._id), String(r2c8._id), "The course very easy to understand");
    const c2r2c8 = await comments.createComment(String(S4._id), String(r2c8._id), "Easy to understand the concepts");

    const r1c9 = await reviews.createReview(String(C9._id), String(S7._id), "spring2022", 4, "Concepts are easy to understand");
    const c1r1c9 = await comments.createComment(String(S5._id), String(r1c9._id), "The course very easy to understand");
    const c2r1c9 = await comments.createComment(String(S6._id), String(r1c9._id), "Easy to understand the concepts");

    const r2c9 = await reviews.createReview(String(C9._id), String(S8._id), "fall2022", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c9 = await comments.createComment(String(S7._id), String(r2c9._id), "The course very easy to understand");
    const c2r2c9 = await comments.createComment(String(S9._id), String(r2c9._id), "Easy to understand the concepts");
    
    const r1c10 = await reviews.createReview(String(C10._id), String(S8._id), "fall2022", 4, "Concepts are easy to understand");
    const c1r1c10 = await comments.createComment(String(S10._id), String(r1c10._id), "The course very easy to understand");
    const c2r1c10 = await comments.createComment(String(S1._id), String(r1c10._id), "Easy to understand the concepts");

    const r2c10 = await reviews.createReview(String(C10._id), String(S10._id), "fall2021", 5, "Very Nice course, you can easily understand the concepts");
    const c1r2c10 = await comments.createComment(String(S2._id), String(r2c10._id), "The course very easy to understand");
    const c2r2c10 = await comments.createComment(String(S3._id), String(r2c10._id), "Easy to understand the concepts");
    
    const admin = await courses.addAdmin("admin@gmail.com", "Admin@123");

    console.log('Done seeding database for course Collection!');
    db.close()
};

main().catch(error => {
    console.log(error);
});