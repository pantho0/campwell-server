const express = require('express')
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
//Middlewares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.guubgk2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const campsCollections = client.db('campwell').collection('camps')

    app.get("/api/v1/get-all-camps", async(req,res)=>{
      let sortObj = {}
      const sortField = req.query.sortField;
      const sortOrder = req.query.sortOrder;
      if(sortField && sortObj){
        sortObj[sortField] = sortOrder
      }
      const result = await campsCollections.find().sort(sortObj).toArray();
      res.send(result)
    })




    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);




































app.get('/', (req,res)=>{
    res.send("CampWell Server is Up")
})

app.listen(port,()=>{
    console.log("Campwell server is running on port", port);
})