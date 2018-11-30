// 链接数据库 导出 db
const mongoose = require("mongoose")
const db = mongoose.createConnection("mongodb://localhost:27017/octopus", {
    useNewUrlParser: true})
mongoose.Promise = global.Promise

const Schema = mongoose.Schema

db.on("error", () => {
    console.log("链接数据库失败");
})
db.on("open", () => {
    console.log("blogproject 数据库链接成功");
})

module.exports = {
    db,
    Schema
}
