const express = require("express");
const router = express.Router();
const data = require('../data/');
const comments = data.comments;
const validate = require('../helper');

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  try {
    id = await validate.validateId(id, "id");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }
  try {
    const comment = await comments.getComment(id);
    res.status(200).render("comment", { commentText: comment.commentText })
  } catch (e) {
    res.status(404).render("error", {
      error: e
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const commentList = await comments.getAllComments();
    res.status(200).json(commentList)
  } catch (e) {
    res.status(404).send();
  }
});

router.post('/:studentId/:reviewId/:courseId/add', async (req, res) => {
  let reviewId = req.params.reviewId
  let studentId = req.params.studentId
  let commentVal = req.body.commentValue
  try {
    reviewId = await validate.validateId(reviewId, "Review Id");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }
  try {
    studentId = await validate.validateId(studentId, "Student Id");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }
  try {
    commentVal = await validate.validateId(commentVal, "Comment");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }
  try {
    addComm = await comments.addComment(studentId, reviewId, commentVal)
    if (addComm) return res.redirect("/courses/" + req.params.courseId);
    else return res.status(404).send();
  } catch (e) {
    res.status(500).render("error", {
      error: e
    });
  }
});

router.get('/:courseId/:commentId/delete', async (req, res) => {
  let courseId = req.params.courseId
  let commentId = req.params.commentId
  try {
    courseId = await validate.validateId(courseId, "Course Id");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }

  try {
    commentId = await validate.validateId(commentId, "Comment Id");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }
  try {
    await comments.getComment(commentId);
  } catch (e) {
    res.status(404).render("error", {
      error: e
    });
    return;
  }
  try {
    deleteCommentRev = await comments.removeComment(commentId);
    if (deleteCommentRev) {
      return res.redirect("/courses/" + courseId);
    } else {
      return res.status(404).send();
    }
  } catch (e) {
    res.status(500).render("error", {
      error: e
    });
  }
});

router.post("/:courseId/:commentId/edit", async (req, res) => {
  let courseId = req.params.courseId
  let commentId = req.params.commentId
  let commentVal = req.body.commentValue;
  try {
    courseId = await validate.validateId(courseId, "Course Id");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }

  try {
    commentId = await validate.validateId(commentId, "Comment Id");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }

  try {
    commentVal = await validate.validateId(commentVal, "Comment");
  } catch (e) {
    res.status(400).render("error", {
      error: e
    });
    return;
  }
  try {
    await comments.updateComment(commentId, commentVal);
    return res.redirect("/courses/" + courseId);
  } catch (e) {
    res.status(404).render("error", {
      error: e
    });
  }
});

module.exports = router;