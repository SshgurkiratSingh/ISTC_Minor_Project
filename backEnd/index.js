const express = require("express");
const app = express();

const cors = require("cors");
const securityRouter = require("./routes/ApiForSecurity");
const frontEndRouter = require("./routes/ApiForFrontend");
const userROuter = require("./routes/ApiForUser");
const ApiForPost = require("./routes/ApiForPost");

const EntryCache = require("./CustomModule/cacheManager");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors()); // Use cors middleware here
app.use(express.json());
app.use("/api/security", securityRouter);
app.use("/api/frontend", frontEndRouter);
app.use("/api/post", ApiForPost);
app.use("/api/userCustom", userROuter);
app.get("/", (req, res) => {
  res.json({
    serverStatus: "Online",
  });
});

const port = 2500; // or any other port number you want to use

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is online at port ${port}!`);
  EntryCache.updateCache("entryLog");
});
