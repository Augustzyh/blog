const {db} = require("../Schema/config")
const UserSchema = require("../Schema/user")

// 操作数据库的模型对象
const User = db.model("users", UserSchema)

module.exports = User