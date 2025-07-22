require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const router = require("./routes");
const path = require("path");
const passport = require("./config/oauth20");
const sessionMiddleware = require("./config/session");
const expressLayouts = require("express-ejs-layouts");
const ownerRoutes = require("./routes/ownerRouter");

const cron = require('node-cron');
const Table = require('./app/models/Table');

cron.schedule('0 0 * * *', async () => {
  try {
    console.log("🕛 Reset session bàn bắt đầu...");
    const result = await Table.updateMany({}, { $set: { session: 1 } });
    console.log(`✅ Reset session xong: ${result.modifiedCount} bàn`);
  } catch (err) {
    console.error("❌ Lỗi khi reset session bàn:", err);
  }
});

const WebSocket = require("ws");
const http = require("http");

const methodOverride = require('method-override');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app); // Create an HTTP server
const wss = new WebSocket.Server({ server }); // Attach WebSocket to the server

app.use("/image", express.static(path.join(__dirname, "public", "image"), { maxAge: "1y" }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "resources", "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");

db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.session?.user || null; 
  next();
});
app.use(express.static(path.join(__dirname, "public")));

router(app);

const paymentController = require('./app/controllers/PaymentController');
app.get('/payment-success', paymentController.paymentSuccessPage);

// WebSocket server logic
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`${message}`);
      }
    });
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});