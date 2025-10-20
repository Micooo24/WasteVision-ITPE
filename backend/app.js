const express = require("express")
const app = express()
const cors = require("cors")
const path =  require("path")

app.use(cors())
app.use(express.json()) 

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")

// Mount routes AFTER body parsers are configured.
app.use("/api/v1",authRoutes)
app.use("/api/v1",userRoutes)


// app.use(express.static(path.join(__dirname, "../ml_service")));
module.exports = app