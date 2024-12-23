const express = require('express');
const app = express();
const port = 1000;

app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Site şu portta çalışıyor: http://localhost:${port}`);
});
