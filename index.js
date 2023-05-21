const express = require('express')
const app = express()
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleWare
// app.use(cors())
const corsOptions ={
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}

app.use(cors(corsOptions))
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lw1wxb4.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect((err) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    // });
//  await client.connect()
    const reactTabDataCollection = client.db("toyfinityManager").collection("toy")
    const toysCollection = client.db("toyManager").collection("toys");
    // Creating index on two fields
    const indexKeys = { name: 1, rating: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "toyName" }; // Replace index_name with the desired index name
    const result = await toysCollection.createIndex(indexKeys, indexOptions);


    // React Tab Collection
    app.get("/tabToys", async (req, res) => {
      try {
        const toys = reactTabDataCollection.find()
        const result = await toys.toArray()
        res.send(result)
      } catch (error) {
        res.send(error)
      }
    })

    // get tab single data 
    app.get("/tabToys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await reactTabDataCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    })

    // get all data
    app.get("/all-toys", async (req, res) => {
      try {
        const toys = toysCollection.find()
        const result = await toys.toArray()
        res.send(result)
      } catch (error) {
        res.send(error)
      }
    })

    // search by text
    app.get("/nameSearch/:text", async (req, res) => {
      try {
        const text = req.params.text;
        const result = await toysCollection
          .find({
            $or: [
              { name: { $regex: text, $options: "i" } },
              { rating: { $regex: text, $options: "i" } },
            ],
          })
          .toArray();
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    });

    // get specific user data using email
    app.get("/my-toys", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { sellerEmail: req.query.email }
        }
        const result = await toysCollection.find(query).toArray();
        res.send(result)
      } catch (error) {
        res.send(error)
      }
    })

    // sort low to high using specific user email
    app.get("/my-toys/ascending", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { sellerEmail: req.query.email }
        }
        const result = await toysCollection.find(query).sort({ price: 1 }).toArray();
        res.send(result)
      } catch (error) {
        res.send(error)
      }
    })

    // sort high to low using specific user email
    app.get("/my-toys/descending", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { sellerEmail: req.query.email }
        }
        const result = await toysCollection.find(query).sort({ price: -1 }).toArray();
        res.send(result)
      } catch (error) {
        res.send(error)
      }
    })

    // get single data 
    app.get("/details/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await toysCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    })

    // insert/upload to db
    app.post("/add-a-toy", async (req, res) => {
      const data = req.body;
      const result = await toysCollection.insertOne(data)
      res.send(result)
    })

    // Update specific data (single) 
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToyData = req.body;
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          ...updatedToyData
        }
      }
      const result = await toysCollection.updateOne(query, updatedDoc, options)
      res.send(result)
    })

    // Delete Specific data.
    app.delete("/all-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Toy server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})