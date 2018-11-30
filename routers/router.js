const Router = require("koa-router")
// 操作user表的逻辑对象
const user = require('../control/user')
const article = require('../control/article')
const comment = require("../control/comment")
const admin = require("../control/admin")
const upload = require("../util/upload")


const router = new Router()

//主页
router.get("/", user.keepLog, article.getList)

//动态路由  用户登陆 注册 动作返回
router.get(/^\/user\/(?=reg|login)/, async ctx => {
    const show = /reg$/.test(ctx.path)
    await ctx.render("register", {show})
})
//登陆
router.post("/user/login", user.login)

// 注册
router.post("/user/reg", user.reg)

// 退出
router.get("/user/logout", user.logout)

// 文章发表
router.get("/article", user.keepLog, article.addPage)

// 文章添加
router.post("/article", user.keepLog, article.add)

// 分页路由
router.get("/page/:id", article.getList)

// 文章详情页
router.get("/article/:id", user.keepLog, article.details)

// 发表评论
router.post("/comment", user.keepLog, comment.save)

// 后台管理页面
router.get("/admin/:id", user.keepLog, admin.index)

// 头像上传   模块 koa-body-upload  koa2-File-upload -> koa-multer
router.post("/upload", user.keepLog, upload.single("file"), user.upload)

// 获取所有评论
router.get("/user/comments", user.keepLog, comment.commentList)

// 删除评论 del请求
router.del("/comment/:id", user.keepLog, comment.delete)

// 获取所有文章
router.get("/user/articles", user.keepLog, article.articleList)

// 删除文章 del请求
router.del("/article/:id", user.keepLog, article.delete)

// 获取所有文章
router.get("/user/users", user.keepLog, article.articleList)

// 删除文章 del请求
router.del("/user/:id", user.keepLog, article.delete)

// 404 任意路由
router.post("*", async ctx => {
    await ctx.render("404", {
        title: 404
    })
})
module.exports =  router