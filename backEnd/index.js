const express = require("express");
const app = express();
const port = 2500;
const cors = require("cors");
const securityRouter = require("./routes/ApiForSecurity");
const frontEndRouter = require("./routes/ApiForFrontend");
const ApiForPost = require("./routes/ApiForPost");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors()); // Use cors middleware here
app.use(express.json());
app.use("/api/security", securityRouter);
app.use("/api/frontend", frontEndRouter);
app.use("/api/post", ApiForPost);

app.get("/", (req, res) => {
  res.json({
    serverStatus: "Online",
  });
});

app.listen(port, () => {
  console.log("Server is online at port 2500 over!");
});
