const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    if (req.headers.get('test-header')) {
        req.redirect('/other-page', 301)
    }

    if (req.baseUrl.includes('home')) {
        res.send(200);
    }

    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
