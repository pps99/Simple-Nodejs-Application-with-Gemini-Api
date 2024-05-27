require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const app = express();
const PORT = process.env.PORT || 8000;

app.set('view engine', 'ejs');
app.set('views',path.resolve('./views'));

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.get('/', (req, res) => {
    const responseText = req.query.response;
    const requestText = req.query.request;
    res.render('home', { response: responseText, request: requestText });
});

app.post('/gemini', async (req, res) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = req.body.userreq;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Redirect with the encoded request and response parameters
        res.redirect(`/?request=${encodeURIComponent(prompt)}&response=${encodeURIComponent(text)}`);
    } catch (error) {
        // Handle error
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => console.log(`Server Started at PORT_${PORT}`));