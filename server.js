const express = require('express');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const uuid = require('uuid');

// Set up file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuid.v4()}-${file.originalname}`);
  },
});

// Set up file upload middleware
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Set up MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/mydatabase';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Set up user model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  avatar: {
    type: String,
  },
  gallery: [{
    type: String,
  }],
});
const User = mongoose.model('User', userSchema);

// Define API endpoints
app.post('/users', async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  });
  try {
    const savedUser = await user.save();
    res.status(201).send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/users/:id/avatar', upload.single('avatar'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).send();
  }
  user.avatar = req.file.filename;
  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/users/:id/gallery', upload.array('images'),
app.post('/users/:id/gallery', upload.array('images'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).send();
  }
  user.gallery = req.files.map((file) => file.filename);
  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).send();
  }
  res.send(user);
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
