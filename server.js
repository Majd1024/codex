const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Define console colors
const colors = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    reset: '\x1b[0m'
};

// Serve static files from the "proto" folder
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'proto', 'index.html'));
});

app.listen(PORT, () => {
    console.log(
        `${colors.blue}Website is running on${colors.reset} ${colors.green}(http://localhost:${PORT})${colors.reset}`
    );
});
