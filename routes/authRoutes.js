const express = require('express');
const passport = require('passport');
const router = express.Router();

// Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google auth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {

    res.redirect('https://web-dma.netlify.app/'); // Redirect to your desired route after successful login
  }
);

// Logout user
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
