const express = require('express');
const User = require('../models/User');

// Endpoint to upload user image
const imageUpload = async (req, res) => {
  const { userId } = req.params;

  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.image = imageUrl;
    await user.save();

    res.status(200).send({ success: true, imageUrl });
  } catch (error) {
    res.status(500).send({ error: 'Failed to upload image', details: error.message });
  }
};


module.exports = 
	{imageUpload}
;