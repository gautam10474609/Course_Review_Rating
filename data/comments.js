const mongoCollections = require("../config/mongoCollections");
const comments = mongoCollections.comments;
const reviews = mongoCollections.reviews;
const validate = require('../helper');
const { ObjectId } = require('mongodb');


module.exports = {
    async addComment(studentId, reviewId, commentInput) {
        id = await validate.validateId(studentId, "studentId");
        id = await validate.validateId(reviewId, "validateId");
        commentInput = await  validate.validateText(commentInput, "commentInput")

        const commentCollection = await comments();
        let addNewComment = {
            studentId: studentId,
            reviewId: reviewId,
            commentText: commentText
        }
        const insertInfo = await commentCollection.insertOne(addNewComment);
        const reviewCollection = await reviews();

        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
            throw 'Could not add new Review';
        } else {
            const updatedInfo = await reviewCollection.updateOne({ _id: ObjectId.createFromHexString(reviewId) }, { $push: { comments: addNewComment._id.toString() } });
            if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) {
                throw 'Could not update Review Collection with Review Data!';
            }
        }
        const newId = insertInfo.insertedId.toString();
        return await this.getComment(newId);;
    },

    async getAllComments() {
        const commentCollection = await comments();
        const allComment = await commentCollection.find({}).toArray();
        if (!allComment) throw "No comments available";
        return allComment;
    },

    async getComment(id) {
        id = await validate.validateId(id, "commentId");
        const commentCollection = await comments();
        const comment = await commentCollection.findOne({ _id: ObjectId(id) });
        if (!comment) throw `No comment exists with the ${id}`;
        return comment;
    },

    async removeComment(id) {
        id = await validate.validateId(id, "commentId");
        const commentCollection = await comments();
        let comment = await this.getComment(id);
        const deleteInfo = await commentCollection.deleteOne({ _id: ObjectId(id) });
        if (deleteInfo.deletedCount === 0) {
            throw `No comment exists with the ${id}`;
        }
        try {
            const reviewCollection = await reviews();
            const deletionInfoForCommentFromReview = await reviewCollection.updateOne({ _id: ObjectId.createFromHexString(comment.reviewId) }, { $pull: { comments: id.toString() } });

            if (deletionInfoForCommentFromReview.deletedCount === 0) {
                throw `Could not delete Comment ${id}`;
            }
        } catch (e) {
            throw "not able delete comment from review comments";
        }
        return true;
    },

    async updateComment(id, commentText) {
        id = await validate.validateId(id, "commentId");
        commentInput = await validate.validateText(commentInput, "commentInput")
        const updateCommentData = {};
        updateCommentData.commentText = commentText;
        const commentCollection = await comments();
        const updateCommentInfo = await commentCollection.updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: updateCommentData });
        if (!updateCommentInfo.modifiedCount) throw "Could not update Comment";
        return await this.getComment(id);
    }
}