function getAllCards() {
    let cards = document.getElementsByClassName("card");
    let courses = [];
    for (card of cards) {
        let course = {};
        course.link = card.children[0].children[0].getAttribute("href"); // Targets link of <a>, with id
        course.name = card.children[0].children[0].innerHTML; // Targets content of <a>, name
        course.category = card.children[1].innerHTML;
        course.address = card.children[2].innerHTML;
        course.address2 = card.children[3].innerHTML;
        course.rating = card.children[4].innerHTML;
        courses.push(course);
    }
    return courses;
}

function sortCardsAscending() {
    courses = getAllCards();
    courses.sort(lowToHigh);
    let cards = document.getElementsByClassName("card");
    while(cards[0]) { // Delete all card elements on page
        cards[0].remove();
    }
    const parentDiv = document.getElementsByClassName("course_Collection")[0];
    for (course of courses) { // Reinstantiate all cards in sorted order
        let div = document.createElement("div");
        div.setAttribute("class", "card");
        div.setAttribute("onClick", "location.href=\"" + course.link + "\";");
        let h2 = document.createElement("h2");
        let a = document.createElement("a");
        a.setAttribute("href", course.link);
        a.innerHTML = course.name;
        h2.appendChild(a);
        div.appendChild(h2);
        let p1 = document.createElement("p");
        p1.setAttribute("class", "category");
        p1.innerHTML = course.category;
        div.appendChild(p1);
        let p2 = document.createElement("p");
        p2.innerHTML = course.address;
        div.appendChild(p2);
        let p3 = document.createElement("p");
        p3.innerHTML = course.address2;
        div.appendChild(p3);
        let p4 = document.createElement("p");
        p4.setAttribute("class", "avg");
        p4.innerHTML = course.rating;
        div.appendChild(p4);
        div.appendChild(document.createElement("br"))
        parentDiv.append(div);
    }
}

function sortCardsDescending() {
    courses = getAllCards();
    courses.sort(highToLow);
    let cards = document.getElementsByClassName("card");
    while(cards[0]) {
        cards[0].parentNode.removeChild(cards[0]);
    }
    const parentDiv = document.getElementsByClassName("course_Collection")[0];
    for (course of courses) {
        let div = document.createElement("div");
        div.setAttribute("class", "card");
        div.setAttribute("onClick", "location.href=\"" + course.link + "\";");
        let h2 = document.createElement("h2");
        let a = document.createElement("a");
        a.setAttribute("href", course.link);
        a.innerHTML = course.name;
        h2.appendChild(a);
        div.appendChild(h2);
        let p1 = document.createElement("p");
        p1.setAttribute("class", "category");
        p1.innerHTML = course.category;
        div.appendChild(p1);
        let p2 = document.createElement("p");
        p2.innerHTML = course.address;
        div.appendChild(p2);
        let p3 = document.createElement("p");
        p3.innerHTML = course.address2;
        div.appendChild(p3);
        let p4 = document.createElement("p");
        p4.setAttribute("class", "avg");
        p4.innerHTML = course.rating;
        div.appendChild(p4);
        div.appendChild(document.createElement("br"));
        parentDiv.append(div);
    }
}

function lowToHigh(a, b) {
    ratingA = a.rating.substring(0, 3);
    ratingB = b.rating.substring(0, 3); // Non-numerical ratings should sort to bottom regardless
    if (ratingB === "No ") return -1 // It isn't really important to check contents of other string
    if (ratingA === "No ") return 1 // If both are non-numerical, the sort will be stable
    return parseFloat(ratingA)-parseFloat(ratingB)
}

function highToLow(a, b) {
    ratingA = a.rating.substring(0, 3);
    ratingB = b.rating.substring(0, 3); 
    if (ratingB === "No ") return -1
    if (ratingA === "No ") return 1
    return parseFloat(ratingB)-parseFloat(ratingA)
}