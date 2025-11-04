const express = require('express');
const app = express();

// Test route
app.get('/test', (req, res) => {
  res.json({ msg: 'Test route working' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Test server started on port ${PORT}`));