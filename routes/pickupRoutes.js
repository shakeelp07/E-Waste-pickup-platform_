const express = require('express');
const router = express.Router();
const PickupRequest = require('../models/pickup.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const session = require('express-session');
const nodemailer = require('nodemailer');

// Add session middleware
router.use(session({
  secret: 'ewaste_secret',
  resave: false,
  saveUninitialized: true,
}));

router.get("/pickup", (req, res) => {
  res.render("pickup");
});


router.get('/', (req, res) => {
  res.render('index', { loggedIn: !!req.session.user, user: req.session.user });
});

router.get('/pickup', (req, res) => {
  res.render('pickup');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/submit', async (req, res) => {
  try {
    const { name, email, address, item, pickupDate } = req.body;
    const pickup = new PickupRequest({
      name,
      email,
      address,
      item,
      preferredDate: pickupDate,
    });
    await pickup.save();
    res.redirect('/pickups');
  } catch (err) {
    console.error('Error saving pickup:', err);
    res.status(500).send('Error scheduling pickup');
  }
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('<h2>Email already registered. <a href="/signup">Try again</a></h2>');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.send('<h2>Registration successful! <a href="/login">Login here</a></h2>');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Error registering user.');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send('<h2>User not found. <a href="/login">Try again</a></h2>');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.send('<h2>Invalid password. <a href="/login">Try again</a></h2>');
    }
    req.session.user = { name: user.name, email: user.email };
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Error during login.');
  }
});

router.post('/subscribe', async (req, res) => {
  const { newsletterEmail } = req.body;
  console.log('New newsletter subscription:', newsletterEmail);
  // Send confirmation email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: newsletterEmail,
      subject: 'Thank you for subscribing to E-Waste Pickup updates!',
      text: 'You have successfully subscribed to E-Waste Pickup updates. We will keep you informed with the latest news and tips on responsible e-waste disposal!\n\nThank you for supporting a greener planet!',
      html: '<h2>Thank you for subscribing to E-Waste Pickup updates!</h2><p>We will keep you informed with the latest news and tips on responsible e-waste disposal.<br><br>Thank you for supporting a greener planet!</p>',
    });
    res.send('<h2>Thank you for subscribing! A confirmation email has been sent to you.</h2><a href="/">Back to Home</a>');
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    res.send('<h2>Subscription received, but failed to send confirmation email.</h2><a href="/">Back to Home</a>');
  }
});

router.get('/pickups', async (req, res) => {
  try {
    const pickups = await PickupRequest.find().sort({ preferredDate: 1 });
    res.render('pickups', { pickups });
  } catch (err) {
    console.error('Error fetching pickups:', err);
    res.status(500).send('Error loading scheduled pickups');
  }
});

// Admin routes
router.get('/admin', async (req, res) => {
  try {
    const pickups = await PickupRequest.find().sort({ preferredDate: 1 });
    res.render('admin', { pickups });
  } catch (err) {
    console.error('Error fetching pickups for admin:', err);
    res.status(500).send('Error loading admin dashboard');
  }
});

router.post('/admin/update-status', async (req, res) => {
  try {
    const { pickupId, status } = req.body;
    await PickupRequest.findByIdAndUpdate(pickupId, { status });
    res.redirect('/admin');
  } catch (err) {
    console.error('Error updating pickup status:', err);
    res.status(500).send('Error updating status');
  }
});

router.get('/admin/logout', (req, res) => {
  res.redirect('/');
});

module.exports = router; 