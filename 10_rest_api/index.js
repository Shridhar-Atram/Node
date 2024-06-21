const express = require("express");
const users = require("./MOCK_DATA.json");
const fs = require("fs");
const port = 8000;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Add this middleware to parse JSON bodies

app.get("/api/users", (req, res) => {
  return res.json(users);
});

app.get("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);
  return res.json(user);
});

app.post("/api/users", (req, res) => {
  const body = req.body;
  users.push({ ...body, id: users.length + 1 });
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Failed to write data" });
    }
    return res.json({ status: "success", id: users.length });
  });
});

app.patch("/api/users/:id", (req, res) => {
  const userID = Number(req.params.id);
  const updates = req.body;
  fs.readFile("./MOCK_DATA.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading data file");
    }
    let users = JSON.parse(data);
    const userIndex = users.findIndex((user) => user.id === userID);
    if (userIndex === -1) {
      return res.status(404).send("User not found");
    }
    users[userIndex] = { ...users[userIndex], ...updates };
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), "utf8", (err) => {
      if (err) {
        return res.status(500).send("Error writing data file");
      }
      res.send(users[userIndex]);
    });
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
