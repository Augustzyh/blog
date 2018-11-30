const {db} = require("../Schema/config")
const CommentSchema = require("../Schema/comment")

// 操作数据库的模型对象
const Comment = db.model("comments", CommentSchema)

module.exports = Comment