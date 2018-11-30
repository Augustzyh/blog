const {Schema} = require("./config")
const ObjectId = Schema.Types.ObjectId
const ConmentSchema = new Schema({
    // 内容
    content: String,
    // 关联用户集合
    from: {
        type: ObjectId,
        ref: "users"
    },
    // 关联文章集合
    article: {
        type: ObjectId,
        ref: "articles"
    }
},{
    versionKey: false,
    timestamps: {
        createdAt: "created"   //创建时间UTC
    }
})

// 设置评论的 remove 钩子
/*
* pre 前置钩子 事件发生之前监听   可绑定多个
* pre间链接 ：next传下去， this指向当前集合
* post 也是删除事件之前， 后置钩子， 必须写在最后   最后一个
* */
/*
CommentSchema.pre("remove", (next) => {

})
*/


// 监听原型上触发的方法
ConmentSchema.post("remove", (document) => {
    // 操作数据库的模型对象
    const User = require("../Models/user")
    const Article = require("../Models/article")
    const {from, article} = document
    // 对应文章评论数 -1
    Article.updateOne({_id: article}, {$inc: {commentNum: -1}}).exec()
    // 当前被删除评论作者的commentNum -1
    User.updateOne({_id: from}, {$inc: {commentNum: -1}}).exec()
})
module.exports = ConmentSchema