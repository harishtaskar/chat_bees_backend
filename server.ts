import 'dotenv/config';
import express from 'express';
import { PORT } from './config/config';
import bodyParser from 'body-parser';
var cors = require('cors')
import user_router from './routes/user_routes';
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/user", user_router);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`)
})