const crypto = require("../util/crypto")

// 操作数据库的模型对象
const User = require("../Models/user")
//注册
exports.reg = async ctx => {
    console.log("这是处理用户注册的中间件")
    //注册发过来的数据
    const user = ctx.request.body
    const username = user.username
    const password = user.password
    console.log(username);
    console.log(password);
    // 操作格式符合时 1，数据库user查询发过来的username是否存在
    await new Promise((resolve, reject) => {
        User.find({username}, (err, data) => {
            if(err) return reject(err)
            if(data.length !== 0) {
                // 有数据 用户名存在
                return resolve()
            }
            // 用户名不存在 存入数据库
            const _user = new User({
                username,
                password: crypto(password),
                commentNum: 0,
                articleNum: 0
            })
            _user.save((err, data) => {
                if(err) {
                    reject(err)
                }else {
                    resolve(data)
                }
            })
        })
    })
        .then(async data => {
            if(data){
                //注册成功
                await ctx.render("isOk",{
                    status: "注册成功"
                })
            }else {
                //用户名已存在
                await ctx.render("isOk",{
                    status: "注册成功"
                })
            }
        })
        .catch(async err => {
            await ctx.render("isOk",{
                status: "注册失败，请重试"
            })
        })
}
//登陆
exports.login = async ctx => {
    const user = ctx.request.body
    const username = user.username
    const password = user.password
    await new Promise((resolve, reject) => {
        User.find({username}, (err,data) => {
            if(err)return reject(err)
            if(data.length === 0) return reject("用户名不存在")
            //比对密码
            if(data[0].password === crypto(password)){
                return resolve(data)
            }
            resolve("")
        })
    })    //exec 回调 .then 才能让find跑起来
        .then(async data => {
            if(!data) {
                await ctx.render("isOk", {
                    status: "密码不正确，登陆失败"
                })
            }

            // 登陆成功前要用户设置cookie 若前端没有cookie则重新登陆
            ctx.cookies.set("username", username, {
                // 挂在主机名，只在此域名下有效
                domain: "localhost",
                path: "/",
                maxAge: 36e5,
                httpOnly: true,  //true不让客户端访问cookie
                overwrite: false
                //singed: true  //默认true
            })
            // 密码就不用了  给id 利于查删
            ctx.cookies.set("uid", data[0]._id, {
                // 挂在主机名，只在此域名下有效
                domain: "localhost",
                path: "/",
                maxAge: 36e5,
                httpOnly: true,  //true不让客户端访问cookie
                overwrite: false
                //singed: true
            })

            //cookie 取出来和后台session对比
            ctx.session = {
                username: username,
                uid: data[0]._id,
                avatar: data[0].avatar,
                role: data[0].role
            }

            await ctx.render("isOk", {
                status: "登陆成功!"
            })
        })
        .catch(async err => {
            await ctx.render("isOk", {
                status: "登录失败，请检查用户名或密码"
            })
        })
}
//状态保持
exports.keepLog = async (ctx, next) => {
    // 判断是否是新的  ctx.session.isNew 为false则已登录
    //console.log(ctx.session.isNew);
    if(ctx.session.isNew) {   //session 没有
        if(ctx.cookies.get("uid")) {
            ctx.session = {
                username: ctx.cookies.get("username"),
                uid: ctx.cookies.get("uid")
            }
        }
    }

    await next()
}
//用户退出
exports.logout = async ctx => {
    //session cookie 清空
    ctx.session = null
    ctx.cookies.set("username", null, {
        maxAge: 0
    })
    ctx.cookies.set("uid", null, {
        maxAge: 0
    })
    //重定向到根页面
    ctx.redirect("/")
}

//头像上传
exports.upload = async ctx => {
    const filename = ctx.req.file.filename
    let data = {}
    await User.update({_id: ctx.session.uid},
        {$set: {avatar: "/avatar/" + filename}}, (err, res) => {
        if(err) {
            data = {
                status: 0,
                message: err
            }
        }else {
            data = {
                status: 1,
                message: "上传成功"
            }
        }
        })
    //console.log(ctx.session);
    ctx.session.avatar = "/avatar/" + filename
    //ctx.type = "json"
    ctx.body = data
}

//管理员 用户打印
exports.userList = async ctx => {

}

//管理员 删除用户
exports.delete = async ctx => {

}