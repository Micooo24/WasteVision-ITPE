const express = require("express")
const app = express()
const cors = require("cors")
const path =  require("path")
app.use(cors())
app.use(express.json({limit:"500mb"}))

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/useRoutes")

app.use("/api/v1",authRoutes)
app.use("/api/v1",userRoutes)


// app.use(express.static(path.join(__dirname, "../ml_service")));
module.exports = app