// 操作数据库的模型对象
const User = require("../Models/user")
const Article = require("../Models/article")
const Comment = require("../Models/comment")

// 保存评论
exports.save = async ctx => {
    let message = {
        status: 0,
        msg: "登陆才可以发表哦"
    }

    //验证用户是否登陆
    if(ctx.session.isNew) return ctx.body = message

    // 用户已登陆
    const data = ctx.request.body
    data.from = ctx.session.uid
    const _comment = new Comment(data)
    await _comment
        .save()
        .then(data => {
            message = {
                status: 1,
                msg: "评论成功"
            }

            // 更新评论数量
            Article
                .update({_id: data.article}, {
                    $inc: {commentNum: 1}
                    },
                    err => {
                        if(err) console.log(err);
                    },
                )
            User
                .update({_id: data.from}, {
                    $inc: {commentNum: 1}
                }, err => {
                    if(err) console.log(err);
                })
            })
        .catch(err => {
            message = {
                status:0,
                msg: err
            }
        })

    ctx.body = message
}

// 评论列表
exports.commentList = async ctx => {
    const uid = ctx.session.uid
    const data = await Comment
        .find({from: uid})
        .populate("article", "title")
    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

// 评论删除
exports.delete = async ctx => {
    // 评论的 id
    const commentID = ctx.params.id
    // And ...还有构造函数操作数据库的一定不会触发钩子直接进入数据库 绕过钩子
    //Comment.findByIdAndRemove(commentID).exec()

    let res = {
        state: 1,
        message: "删除成功"
    }
    // 以下可监听
    Comment.findById(commentID)
        .then(data => data.remove())
        .catch(err => {
            if(err) {
                res = {
                    state: 0,
                    message: err
                }
            }
        })
    ctx.body = res


    /*let uid = 0
    let articleID = 0

    let isOk = true
    // 删除
    await Comment.findById(commentID, (err,data) => {
        if(err) {
            console.log(err);
            isOk = false
            return
        } else {
            articleID = data.article
            uid = data.from
        }
    })

    // 让文章评论计数器-1
    await Article.update({_id: articleID}, {$inc: {commentNum: -1}})
    await User.update({_id: uid}, {$inc: {commentNum: -1}})
    await Comment.deleteOne({_id: commentID})

    if(isOk){
        ctx.body = {
            state: 1,
            message: "删除成功"
        }
    }*/
}