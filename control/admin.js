const {db} = require("../Schema/config")
const ArticleSchema = require("../Schema/article")
const UserSchema = require("../Schema/user")
const CommentSchema = require("../Schema/comment")

// 操作数据库的模型对象
const User = db.model("users", UserSchema)
const Article = db.model("articles", ArticleSchema)
const Comment = db.model("comments", CommentSchema)
const fs = require("fs")
const {join} = require("path")


exports.index = async ctx => {
    if(ctx.session.isNew){
        //没有登陆
        ctx.status = 404
        return await ctx.render("404", {title: "404"})
    }
    const id = ctx.params.id
    let flag = false
    const arr = fs.readdirSync(join(__dirname, "../views/admin"))
    arr.forEach((v) => {
        //console.log(v.replace(/^(admin\-)|(\.pug)$/g, ""));
        const name = v.replace(/^(admin\-)|(\.pug)$/g, "")
        if(name === id) {
            flag = true
        }
    })
    if(flag) {
        await ctx.render("./admin/admin-" + id, {
            role: ctx.session.role
        })
    }
}