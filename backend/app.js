const express = require("express")
const app = express()
const cors = require("cors")
const path =  require("path")

app.use(cors())

// // **CORRECT ORDER:** Define body parsers with limits BEFORE routes.
// app.use(express.json({limit:"100mb"}))
// app.use(express.urlencoded({ limit: '100mb', extended: true }));

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")

// Mount routes AFTER body parsers are configured.
app.use("/api/v1",authRoutes)
app.use("/api/v1",userRoutes)


// app.use(express.static(path.join(__dirname, "../ml_service")));
module.exports = app