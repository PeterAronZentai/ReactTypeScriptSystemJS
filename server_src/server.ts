import * as express from 'express'

var app = express()


app.use("/", express.static("./"))
app.listen(process.env.PORT || 5000, () => {
  console.log("server started")
})