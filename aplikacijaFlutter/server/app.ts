import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import { userRouter } from './routes/user.router';
import { stickersRouter } from './routes/stickers.router';

// Create an Express web application
const app = express();
app.use(express.json()); 
app.use(cors());

// Define the port for your server
const port = process.env.PORT || 3001;

// Create a MySQL database connection
const db = mysql.createConnection({
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

const router = express.Router();
app.use('/', router);
router.use('/users', userRouter);
router.use("/stickers", stickersRouter)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




