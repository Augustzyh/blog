const {Schema} = require("./config")
const ObjectId = Schema.Types.ObjectId
const ArticleSchema = new Schema({
    title: String,
    content: String,
    author: {
        type: ObjectId,
        ref: "users"
    },  // 关联user表
    tips: String,
    commentNum: Number
},{
    versionKey: false,
    timestamps: {
        createdAt: "created"   //创建时间UTC
    }
})

ArticleSchema.post("remove", doc => {
    const Comment = require("../Moudles/comment")
    const User = require("../Moudles/user")
    const {_id:artId , author: authorId} = doc
    // 文章数-1
    User.findByIdAndUpdate(authorId, {$inc: {articleNum: -1}}).exec()
    // 所有评论删掉
    Comment.find({article: artId})
        .then(data => {
            data.forEach(v => v.remove())
        })
})
module.exports = ArticleSchema