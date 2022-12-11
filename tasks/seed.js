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
    const C1 = await courses.addCourse("Introduction to JAVA Programming", "CS 501", "Peter William", "Sham Shah", 3, "peter@stevens.edu", "sham@stevens.edu");
    const C2 = await courses.addCourse("Fundamentals of Computing", "CS 515", "Robert Doe", "Rolando Robert", 3, "robert@stevens.edu", "rolando@stevens.edu");
    const C3 = await courses.addCourse("Computer Organization and Programming", "CS 551", "Jeffer Lyons ", "Parth Kumar", 3, "jeffer@stevens.edu", "parth@stevens.edu");
    const C4 = await courses.addCourse("Algorithms", "CS 590", "David Jukrat", "Tejas Jain", 3, "pjukrat@stevens.edu", "tejas@stevens.edu");
    const C5 = await courses.addCourse("Principles of Programming Languages", "CS 510", "Alice Brown", "Aman Malhotra", 3, "alice@stevens.edu", "aman@stevens.edu");
    const C6 = await courses.addCourse("Compiler Design and Implementation", "CS 516", "Mark Grrenberg", "Willian Watt", 3, "mark@stevens.edu", "william@stevens.edu");
    const C7 = await courses.addCourse("TCP/IP Networking", "CS 521", "David Thomas", "Karan Jain", 3, "david@stevens.edu", "karan@stevens.edu");
    const C8 = await courses.addCourse("Enterprise and Cloud Computing", "CS 526", "Felice Smith", "Joseph Witt", 3, "felice@stevens.edu", "joseph@stevens.edu");
    const C9 = await courses.addCourse("Interactive Computer Graphics", "CS 537", "Zun Ju", "Smitha Patil", 3, "zun@stevens.edu", "smitha@stevens.edu");
    const C10 = await courses.addCourse("Web Programming", "CS 546", "Patrick Hill", "Aditya Kapoor", 3, "patrick@stevens.edu", "aditya@stevens.edu");
   
    //Seed Sample Students
    const S1 = await students.addStudents("Donald", "Brown", "donald@stevens.edu", "$2a$16$55b4ftaRCsHZcJ2X3VAmL.X85wi/K3ydOMWRoyafn2ubiA38l4HnK");
    const S2 = await students.addStudents("Kartik", "Shah", "kartik@stevens.edu", "$2y$16$44T/HRDYr7ZJr5NgxKZ0GO5VUWIO7eEzeh.SQauQqfsUhjLLm8XBq");
    const S3 = await students.addStudents("Michael", "Trump", "michael@stevens.edu", "$2y$16$hJSJuDrg9GRus/zD3mfg..OhlFSEM1VFeOi4cxJhxKhHHmpPZRnjW");
    const S4 = await students.addStudents("Sanjeev", "Bhatt", "sanjeev@stevens.edu", "$2y$16$yRArTdcisBcd6ED5FEWJuO/Z.LMWsUbHz52FotTzYtf86Kc4QKE6a");
    const S5 = await students.addStudents("Danny", "Sussan", "dan@stevens.edu", "$2y$16$KIjnyLrJ02Kpp6Y6HLZ6C.BDZidhOY73JYc4utfKCJB48Ithhr1oK");
    const S6 = await students.addStudents("Miles", "Tartaglia", "miles@stevens.edu","$2y$16$ZvmyAhGKEXDIe1gDejC38.K7xWYnF2SzYhlr4GTuv6cNFmqbtH2k6");
    const S7 = await students.addStudents("John", "Rosenberg", "john@stevens.edu", "$2y$16$dm4xV.Gvptu2Xl3Kh/S/suk8OoUoKZXUkqKExk8WD3ZUZXxd4QeK.");
    const S8 = await students.addStudents("Jessica", "Doen", "jessica@stevens.edu", "$2y$16$nEHCMDVuRC52/1j2AXfsyu5zsh3btEm0a3uvq.35kpEYR/pnFfS2a");
    const S9 = await students.addStudents("Kamil", "Pelis", "kamil@stevens.edu", "$2y$16$IlU5ezmEuCip.KMmemBi7ePqMtT9JKkzZXhH05ILe7tqeKZemFn.m");
    const S10 = await students.addStudents("Alice", "Smith", "alice@stevens.edu", "$2y$16$E0t0gNTnCXbW.nvDjnQSZ.yUN0cjdv4sHIWHciyu45N4BEdamdBzu");

    //Seed Sample Reviews
    const review1ForC1 = await reviews.addReview(String(C1._id), String(S1._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC1 = await comments.addComment(String(S10._id), String(review1ForC1._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC1 = await comments.addComment(String(S9._id), String(review1ForC1._id), "Yes, Yes, Yes!!");

    const review2ForC1 = await reviews.addReview(String(C1._id), String(S2._id), "Loved the course!", 5, "");
    const comment1ForReview2ForC1 = await comments.addComment(String(S8._id), String(review2ForC1._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC1 = await comments.addComment(String(S7._id), String(review2ForC1._id), "Yes, Yes, Yes!!");
    
    const review1ForC2 = await reviews.addReview(String(C2._id), String(S3._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC2 = await comments.addComment(String(S6._id), String(review1ForC2._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC2 = await comments.addComment(String(S5._id), String(review1ForC2._id), "Yes, Yes, Yes!!");

    const review2ForC2 = await reviews.addReview(String(C2._id), String(S4._id), "Loved the course!", 5);
    const comment1ForReview2ForC2 = await comments.addComment(String(S3._id), String(review2ForC2._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC2 = await comments.addComment(String(S2._id), String(review2ForC2._id), "Yes, Yes, Yes!!");
    
    const review1ForC3 = await reviews.addReview(String(C3._id), String(S5._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC3 = await comments.addComment(String(S1._id), String(review1ForC3._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC3 = await comments.addComment(String(S2._id), String(review1ForC3._id), "Yes, Yes, Yes!!");

    const review2ForC3 = await reviews.addReview(String(C3._id), String(S6._id), "Loved the course!", 5);
    const comment1ForReview2ForC3 = await comments.addComment(String(S3._id), String(review2ForC3._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC3 = await comments.addComment(String(S4._id), String(review2ForC3._id), "Yes, Yes, Yes!!");

    const review1ForC4 = await reviews.addReview(String(C4._id), String(S7._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC4 = await comments.addComment(String(S5._id), String(review1ForC4._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC4 = await comments.addComment(String(S6._id), String(review1ForC4._id), "Yes, Yes, Yes!!");

    const review2ForC4 = await reviews.addReview(String(C4._id), String(S8._id), "Loved the course!", 5);
    const comment1ForReview2ForC4 = await comments.addComment(String(S7._id), String(review2ForC4._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC4 = await comments.addComment(String(S9._id), String(review2ForC4._id), "Yes, Yes, Yes!!");
    
    const review1ForC5 = await reviews.addReview(String(C5._id), String(S8._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC5 = await comments.addComment(String(S10._id), String(review1ForC5._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC5 = await comments.addComment(String(S1._id), String(review1ForC5._id), "Yes, Yes, Yes!!");

    const review2ForC5 = await reviews.addReview(String(C5._id), String(S10._id), "Loved the course!", 5);
    const comment1ForReview2ForC5 = await comments.addComment(String(S2._id), String(review2ForC5._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC5 = await comments.addComment(String(S3._id), String(review2ForC5._id), "Yes, Yes, Yes!!");

    const review1ForC6 = await reviews.addReview(String(C6._id), String(S1._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC6 = await comments.addComment(String(S10._id), String(review1ForC6._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC6 = await comments.addComment(String(S9._id), String(review1ForC6._id), "Yes, Yes, Yes!!");

    const review2ForC6 = await reviews.addReview(String(C6._id), String(S2._id), "Loved the course!", 5);
    const comment1ForReview2ForC6 = await comments.addComment(String(S8._id), String(review2ForC6._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC6 = await comments.addComment(String(S7._id), String(review2ForC6._id), "Yes, Yes, Yes!!");
    
    const review1ForC7 = await reviews.addReview(String(C7._id), String(S3._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC7 = await comments.addComment(String(S6._id), String(review1ForC7._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC7 = await comments.addComment(String(S5._id), String(review1ForC7._id), "Yes, Yes, Yes!!");

    const review2ForC7 = await reviews.addReview(String(C7._id), String(S4._id), "Loved the course!", 5);
    const comment1ForReview2ForC7 = await comments.addComment(String(S3._id), String(review2ForC7._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC7 = await comments.addComment(String(S2._id), String(review2ForC7._id), "Yes, Yes, Yes!!");
    
    const review1ForC8 = await reviews.addReview(String(C8._id), String(S5._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC8 = await comments.addComment(String(S1._id), String(review1ForC8._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC8 = await comments.addComment(String(S2._id), String(review1ForC8._id), "Yes, Yes, Yes!!");

    const review2ForC8 = await reviews.addReview(String(C8._id), String(S6._id), "Loved the course!", 5);
    const comment1ForReview2ForC8 = await comments.addComment(String(S3._id), String(review2ForC8._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC8 = await comments.addComment(String(S4._id), String(review2ForC8._id), "Yes, Yes, Yes!!");

    const review1ForC9 = await reviews.addReview(String(C9._id), String(S7._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC9 = await comments.addComment(String(S5._id), String(review1ForC9._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC9 = await comments.addComment(String(S6._id), String(review1ForC9._id), "Yes, Yes, Yes!!");

    const review2ForC9 = await reviews.addReview(String(C9._id), String(S8._id), "Loved the course!", 5);
    const comment1ForReview2ForC9 = await comments.addComment(String(S7._id), String(review2ForC9._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC9 = await comments.addComment(String(S9._id), String(review2ForC9._id), "Yes, Yes, Yes!!");
    
    const review1ForC10 = await reviews.addReview(String(C10._id), String(S8._id), "Amazing course! Easy to understand", 4);
    const comment1ForReview1ForC10 = await comments.addComment(String(S10._id), String(review1ForC10._id), "Yes, the course is very easy!");
    const comment2ForReview1ForC10 = await comments.addComment(String(S1._id), String(review1ForC10._id), "Yes, Yes, Yes!!");

    const review2ForC10 = await reviews.addReview(String(C10._id), String(S10._id), "Loved the course!", 5);
    const comment1ForReview2ForC10 = await comments.addComment(String(S2._id), String(review2ForC10._id), "Yes, the course is very easy!");
    const comment2ForReview2ForC10 = await comments.addComment(String(S3._id), String(review2ForC10._id), "Yes, Yes, Yes!!");
    

    console.log('Done seeding database for course Collection!');
	await db.serverConfig.close();
};

main().catch(error => {
    console.log(error);
});