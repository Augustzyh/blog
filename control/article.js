// 操作数据库的模型对象
const User = require("../Models/user")
const Article = require("../Models/article")
const Comment = require("../Models/comment")

//发表页面渲染
exports.addPage = async ctx => {
    await ctx.render("add-article", {
        title: "发表文章",
        session: ctx.session
    })
}

// 文章发表保存至数据库
exports.add = async ctx => {
    // 未登陆
    if(ctx.session.isNew) {
        return ctx.body = {
            msg: "用户未登陆",
            status: 0
        }
    }

    // 登陆了
    // 发过来的数据
    const data = ctx.request.body
    data.author = ctx.session.uid
    data.commentNum = 0
    await new Promise((resolve, reject) => {
        new Article(data).save((err, data) => {
            if(err) return reject(err)
            //更新用户文章数
            User
                .update({_id: data.author}, {
                    $inc: {articleNum: 1}
                },err => {
                    if(err) console.log(err);
                    // 更新成功
                })
            resolve(data)
        })
    })
        .then(data => {
            ctx.body = {
                msg: "保存成功",
                status: 1
            }
        })
        .catch(err => {
            ctx.body = {
                msg: "保存失败",
                status: 0
            }
        })
}

//获取文章列表
exports.getList = async ctx => {
    // 拿到每篇文章对应的作者头像
    //id ctx.parmas.id  默认1
    let page = ctx.params.id || 1
    page--

    // 获取文档最大文章数
    const maxNum = await Article.estimatedDocumentCount((err, num) => err ? console.log(err) : num)

    // 每页5个，第二页跳过skip 5条 5-10
    // 筛选接下来的5条 limit
    const artList = await Article
        .find()
        .sort("-created")
        .skip(10 * page)
        .limit(10)
    // 这里拿到10条文章数据
        .populate({
            path: "author",
            select: "_id username avatar"
        })  // mongoose 用于连表查询
        .then(data => data)
        .catch(err => console.log(err))

    //console.log(artList);

    await ctx.render("index", {
        title: "Octopus",
        session: ctx.session,
        artList,
        maxNum
    })
    // await ctx.render("index", {})
}

//文章详情页
exports.details = async ctx => {
    const _id = ctx.params.id

    const article = await Article
        .findById(_id)
        .populate("author","username")
        .then(data => data)

    //查找评论
    const comment = await Comment
        .find({article: _id})
        .sort("-created")
        .populate("from", "username avatar")
        .then(data => data)
        .catch(err => console.log(err))
    console.log(comment);
    await ctx.render("article", {
        title: article.title,
        article,
        session: ctx.session,
        comment
    })
}

//管理台文章列表
exports.articleList = async ctx => {
    const uid = ctx.session.uid
    const data = await Article.find({author: uid})
    //console.log(data);
    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

// 删除文章
exports.delete = async ctx => {
    const _id = ctx.params.id

    let res = {
        state: 1,
        message: "成功"
    }
    Article.findById(_id)
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
}
