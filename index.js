const express = require('express')
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const usersCollections = client.db('campwell').collection('users')

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

    app.get('/api/v1/camp-details/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await campsCollections.findOne(query);
      res.send(result)
    })

    app.get('/api/v1/manage-camp/:email', async(req,res)=>{
      const email = req.params.email;
      const query = {organizer_email: email};
      const result = await campsCollections.find(query).toArray();
      res.send(result)
    })
    
    
    app.post('/api/v1/add-camp', async(req,res)=>{
      const campData = req.body;
      const result = await campsCollections.insertOne(campData);
      res.send(result);
    })

    app.get('/api/v1/get-user/:email', async(req,res)=>{
      const email = req.params.email;
      const query = {email : email}
      const result = await usersCollections.findOne(query);
      res.send(result)
      
    })
    app.post('/api/v1/save-user', async(req,res)=>{
      const userInfo = req.body;
      const result = await usersCollections.insertOne(userInfo);
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