const express = require('express')
const cors = require('cors');
require('dotenv').config()
const stripe = require('stripe')(process.env.PAYMENT_API_SECRET)
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
    const registrationCollections = client.db('campwell').collection('registration')


    //stripe api
    app.post('/create-payment-intent', async(req, res)=>{
      const {price} = req.body;
      const amount = parseInt(price*100)
      const paymentIntent = await stripe.paymentIntents.create({
        amount : amount,
        currency : 'usd',
        payment_method_types: [
          "card",
        ],
      })
      res.send({
        clientSecret : paymentIntent.client_secret,
      })
    })



    //to get all camps
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
    // to get camps details
    app.get('/api/v1/camp-details/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await campsCollections.findOne(query);
      res.send(result)
    })

    // to update camps data 
    app.patch("/api/v1/update-camp/:id", async(req,res)=>{
      const camp = req.params.id;
      const campInfo = req.body;
      const filter = {_id: new ObjectId(camp)}
      const update = {
        $set: {
          ...campInfo
        }
      }
      const result = await campsCollections.updateOne(filter, update)
      res.send(result)
    })

    //to manage camps (api for organizer)
    app.get('/api/v1/manage-camp/:email', async(req,res)=>{
      const email = req.params.email;
      const query = {organizer_email: email};
      const result = await campsCollections.find(query).toArray();
      res.send(result)
    })
    //to add camps (api for organizer)   
    app.post('/api/v1/add-camp', async(req,res)=>{
      const campData = req.body;
      const result = await campsCollections.insertOne(campData);
      res.send(result);
    })

    // to get registration infos base on participants email
    app.get("/api/v1/get-registration-data/:email", async(req,res)=>{
      try{
        const participantEmail = req.params.email;
        const query = {email : participantEmail};
        const result = await registrationCollections.find(query).toArray()
        res.send(result)
      }catch(error){
        console.log("error fetching registration data",error);
        res.status(500).send({error:"Internal Server Error"})
      }
      
    })

    // to add register data (api for participants)
    app.post("/api/v1/registration", async(req,res)=>{
      const registration = req.body;
      const result = await registrationCollections.insertOne(registration);
      res.send(result)
    })


    //to detect user role 
    app.get('/api/v1/get-user/:email', async(req,res)=>{
      const email = req.params.email;
      const query = {email : email}
      const result = await usersCollections.findOne(query);
      res.send(result)
      
    })
    //to save user with role
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