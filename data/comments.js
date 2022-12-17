const mongoCollections = require("../config/mongoCollections");
const comments = mongoCollections.comments;
const reviews = mongoCollections.reviews;
const validate = require('../helper');
const { ObjectId } = require('mongodb');

module.exports = {
    async createComment(studentId, reviewId, commentInput) {
        id = await validate.validateId("createComment", studentId, "studentId");
        id = await validate.validateId("createComment", reviewId, "validateId");
        commentInput = await validate.validateString("createComment", commentInput, "commentInput")
        const commentCollection = await comments();
        let addNewComment = {
            studentId: studentId,
            reviewId: reviewId,
            commentInput: commentInput
        }
        const insertInfo = await commentCollection.insertOne(addNewComment);
        const reviewCollection = await reviews();
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'createComment: Could not add new Review';
        } else {
            const updatedInfo = await reviewCollection.updateOne({
                _id: ObjectId(reviewId)
            }, {
                $push:
                {
                    comments: addNewComment._id.toString()
                }
            });
            if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) {
                throw 'createComment: Could not update Review Collection with Review Data!';
            }
        }
        const commentId = insertInfo.insertedId.toString();
        return await this.getComment(commentId);
    },

    async getAllComments() {
        const commentCollection = await comments();
        const allComment = await commentCollection.find({}).toArray();
        if (!allComment) throw "getAllComments: No comments available";
        return allComment;
    },

    async getComment(id) {
        id = await validate.validateId("getComment", id, "commentId");
        const commentCollection = await comments();
        const comment = await commentCollection.findOne({ _id: ObjectId(id) });
        if (!comment) throw `getComment: No comment exists with the ${id}`;
        return comment;
    },

    async removeComment(id) {
        id = await validate.validateId(id, "commentId");
        const commentCollection = await comments();
        let comment = await this.getComment(id);
        const deleteInfo = await commentCollection.deleteOne({ _id: ObjectId(id) });
        if (deleteInfo.deletedCount === 0) {
            throw `removeComment: No comment exists with the ${id}`;
        }
        try {
            const reviewCollection = await reviews();
            const deletionInfoForCommentFromReview = await reviewCollection.updateOne({
                _id: ObjectId(comment.reviewId)
            }, {
                $pull: {
                    comments: id.toString()
                }
            });
            if (deletionInfoForCommentFromReview.deletedCount === 0) {
                throw `removeComment: Could not delete Comment ${id}`;
            }
        } catch (error) {
            throw "removeComment: Not able delete comment from review comments";
        }
        return true;
    },

    async updateComment(id, commentText) {
        id = await validate.validateId("updateComment", id, "commentId");
        commentText = await validate.validateString("updateComment", commentText, "commentInput")
        const updateCommentData = {};
        updateCommentData.commentText = commentText;
        const commentCollection = await comments();
        const updateCommentInfo = await commentCollection.updateOne({
            _id: ObjectId(id)
        },
            {
                $set: updateCommentData
            });
        if (!updateCommentInfo.modifiedCount) throw "updateComment: Could not able update Comment";
        return await this.getComment(id);
    }
}