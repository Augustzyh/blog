const {db} = require("../Schema/config")
const ArticleSchema = require("../Schema/article")

// 操作数据库的模型对象
const Article = db.model("articles", ArticleSchema)

module.exports = Article