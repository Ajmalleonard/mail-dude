require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mailchimp = require("@mailchimp/mailchimp_marketing");

// Load environment variables
const API = process.env.API;
const SERVER = process.env.SERVER;
const ListID = "25413bddce";

// Set up Mailchimp configuration
mailchimp.setConfig({
  apiKey: API,
  server: SERVER,
});

// Port number
const port = process.env.PORT;

// Serve static files from 'public' directory
app.use(express.static("public"));

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve signup.html on root
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

// Handle form submission
app.post("/", async (req, res) => {
  try {
    const { fName, lName, email } = req.body;

    // Log incoming data for debugging (you can remove this in production)
    console.log(fName);
    console.log(lName);
    console.log(email);

    const subscribingUser = {
      firstName: fName,
      lastName: lName,
      email: email,
    };
    const response = await mailchimp.lists.addListMember(ListID, {
      email_address: subscribingUser.email,
      status: "subscribed",
      merge_fields: {
        FNAME: subscribingUser.firstName,
        LNAME: subscribingUser.lastName,
      },
    });
    console.log(response);
    if (response.status === "subscribed") {
      res.sendFile(__dirname + "/success.html");
    } else if (response.status === 400) {
      res.status(400).sendFile(__dirname + "/signed.html");
    } else {
      res.status(500).sendFile(__dirname + "/failure.html");
    }
  } catch (error) {
    console.error(error);
    res.status(500).sendFile(__dirname + "/failure.html");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server Started on port: ${port}`);
});
