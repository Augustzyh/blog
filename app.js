const Koa = require("koa")
const static = require("koa-static")
const views = require("koa-views")
const router = require("./routers/router")
const logger = require("koa-logger")
const {join} = require("path")
const body = require("koa-body")
const session = require("koa-session")
const compress = require("koa-compress")

const app = new Koa()
/*
* 资源压缩模块 ： koa-compress
*
* */
// 注册日志模块
app.use(logger())

// 注册 koa-compress
app.use(compress({
    /*filter: function (content_type) {
        return /text/i.test(content_type)
    }, 指定文件名*/
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}))

// 配置session
app.keys = ["hang is here"]
const CONFIG = {
    key: "Sid",
    maxAge: 36e5,
    overwrite: true,
    httpOnly: true,
    singed: true,   //是否签名
    rolling: true, // 从最后一次操作开始计时1个小时
}

app.use(session(CONFIG, app))

// 解析post请求
app.use(body())

// 配置静态资源目录
app.use(static(join(__dirname, "public")))

// 配置视图模板
app.use(views(join(__dirname, "views"), {
    extension: "pug"
}))



// 注册路由
app.use(router.routes()).use(router.allowedMethods())
app.listen(80, () => {
    console.log("项目启动成功，正在监听localhost：3000端口");
})

// 创建管理员用户
{
    const {db} = require("./Schema/config")
    const UserSchema = require("./Schema/user")
    const User = db.model("users", UserSchema)
    const crypto = require("./util/crypto")

    User
        .find({username: "admin"})
        .then(data => {
            if(data.length === 0) {
                // 管理员不存在
                new User({
                    username: "admin",
                    password: crypto("zyh294276"),
                    role: 666,
                    commentNum: 0,
                    articleNum: 0
                })
                    .save()
                    .then(data => {
                        console.log("管理员用户名 -》 admin 密码 -》 zyh294276");
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }else {
                console.log("管理员用户名 -》 admin 密码 -》 zyh294276");
            }
        })
}