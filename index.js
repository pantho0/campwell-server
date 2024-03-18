const express = require('express')
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
//Middlewares
app.use(cors())
app.use(express.json())


app.get('/', (req,res)=>{
    res.send("CampWell Server is Up")
})

app.listen(port,()=>{
    console.log("Campwell server is running on port", port);
})