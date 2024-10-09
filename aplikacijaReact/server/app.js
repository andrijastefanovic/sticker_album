"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql2_1 = __importDefault(require("mysql2"));
const cors_1 = __importDefault(require("cors"));
const user_router_1 = require("./routes/user.router");
const stickers_router_1 = require("./routes/stickers.router");
// Create an Express web application
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Define the port for your server
const port = process.env.PORT || 3001;
// Create a MySQL database connection
const db = mysql2_1.default.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'diplomski',
});
// Connect to the MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});
// Define routes and middleware for your web app
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
const router = express_1.default.Router();
app.use('/', router);
router.use('/users', user_router_1.userRouter);
router.use("/stickers", stickers_router_1.stickersRouter);
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
