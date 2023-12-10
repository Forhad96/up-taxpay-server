const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(
  cors({
    origin: ["https://celadon-genie-c96a19.netlify.app","http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shhvx1o.mongodb.net/?retryWrites=true&w=majority`;
// const uri =
//   "mongodb+srv://<username>:<password>@cluster0.shhvx1o.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;

  if (!token) {
    return res.status(401).send("unauthorized access");
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send("unauthorized access");
    }

    req.user = decoded;
    next();
  });
};

// Inserting all the data to the database complete

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const villagesCollection = client.db("unionCouncil").collection("villages");
    const taxCollection = client.db("unionCouncil").collection("tax");
    const houseHolderCollection = client
      .db("unionCouncil")
      .collection("houseHolder");

    const businessCollection = client.db("unionCouncil").collection("business");
    const usersCollection = client.db("unionCouncil").collection("users");
    const homeTaxCollection = client.db("unionCouncil").collection("homeTax");
    const businessTaxCollection = client
      .db("unionCouncil")
      .collection("businessTax");
    const settingsCollection = client.db("unionCouncil").collection("settings");

    /*
     * GET METHODS
     */

    // count data
    app.get("/collection/totalCount", async (req, res) => {
      const totalCount = {
        house: 0,
        villages: 0,
        homeTax: 0,
        businessTax: 0,
        business: 0,
      };
      try {
        totalCount.house = await houseHolderCollection.estimatedDocumentCount();

        totalCount.business = await businessCollection.estimatedDocumentCount();

        totalCount.villages = await villagesCollection.estimatedDocumentCount();

        totalCount.homeTax = await homeTaxCollection.estimatedDocumentCount();

        totalCount.businessTax =
          await businessTaxCollection.estimatedDocumentCount();

        res.send(totalCount);
      } catch (error) {
        console.log(error);
        res.status(500).send("There was a server side error!!");
      }
    });

    // get all documents data  from a collection based on types and paginated value
    // [house, business, villages, user, homeTax, businessTax]
    app.get("/collection/:type", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const type = req.params.type;

        // console.log("page:", page, "size: ", size);
        let result;

        if (type.toLowerCase().trim() === "house") {
          result = await houseHolderCollection
            .find()
            .skip(page * size)
            .limit(size)
            .toArray();
        } else if (type.toLowerCase().trim() === "business") {
          result = await businessCollection
            .find()
            .skip(page * size)
            .limit(size)
            .toArray();
        } else if (type.toLowerCase().trim() === "villages") {
          result = await villagesCollection
            .find()
            .skip(page * size)
            .limit(size)
            .toArray();
        } else if (type.toLowerCase().trim() === "users") {
          result = await usersCollection
            .find()
            .skip(page * size)
            .limit(size)
            .toArray();
        }
        /////
        else if (type.toLowerCase().trim() === "tax") {
          result = await taxCollection
            .find()
            .skip(page * size)
            .limit(size)
            .toArray();
        } else if (type.toLowerCase().trim() === "settings") {
          result = await settingsCollection
            .find()
            .skip(page * size)
            .limit(size)
            .toArray();
        }

        // res.send(result);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send(error);
      }
    });

    // get single documents data  from a collection based on types and paginated value
    // [house, business, villages, user, homeTax, businessTax]
    app.get("/collection/:type/:id", async (req, res) => {
      try {
        const { type, id } = req.params;
        // console.log("page:", page, "size: ", size);
        let result = {};

        const query = { _id: new ObjectId(id) };

        if (type.toLowerCase().trim() === "house") {
          result = await houseHolderCollection.findOne(query);
        } else if (type.toLowerCase().trim() === "business") {
          result = await businessCollection.findOne(query);
        } else if (type.toLowerCase().trim() === "villages") {
          result = await villagesCollection.findOne(query);
        } else if (type.toLowerCase().trim() === "users") {
          result = await usersCollection.findOne(query);
        } else if (type.toLowerCase().trim() === "homeTax") {
          result = await homeTaxCollection.findOne(query);
        } else if (type.toLowerCase().trim() === "businessTax") {
          result = await businessTaxCollection.findOne(query);
        }
        /////
        else if (type.toLowerCase().trim() === "tax") {
          result = await taxCollection.findOne(query);
        } else if (type.toLowerCase().trim() === "settings") {
          result = await settingsCollection.findOne(query);
        }
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send(error);
      }
    });

    /*
     * POST METHODS
     */

    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body || {};

        const validUser = await usersCollection.findOne({ email });

        if (validUser && validUser.password === password) {
          const token = jwt.sign({ email }, process.env.SECRET_KEY, {
            expiresIn: "1h",
          });

          res
            .cookie("token", token, {
              httpOnly: true,
              secure: false,
              sameSite: "none",
            })
            .send({ success: true, token: token, email });
        } else {
          res.status(401).send("Unauthorized Access");
        }
      } catch (error) {
        res.status(500).send("Internal server error!");
      }
    });

    app.post("/logout", (req, res) => {
      const { email } = req.body;
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    // add a document in a collection based on type
    // [house, business, villages, user, homeTax, businessTax]
    app.post("/collection/:type", async (req, res) => {
      try {
        const type = req.params.type;

        const data = req.body;

        let result;
        if (type.toLowerCase().trim() === "business") {
          result = await businessCollection.insertOne(data);
        } else if (type.toLowerCase().trim() === "house") {
          result = await houseHolderCollection.insertOne(data);
        } else if (type.toLowerCase().trim() === "users") {
          result = await usersCollection.insertOne(data);
        } else if (type.toLowerCase().trim() === "villages") {
          result = await villagesCollection.insertOne(data);
        }
        ////
        else if (type.toLowerCase().trim() === "tax") {
          result = await taxCollection.insertOne(data);
        }

        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    /*
     * PUT METHODS
     */

    // update a specific document from a collection based on type
    // [house, business, villages, user, homeTax, businessTax]
    app.put("/collection/:type/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const type = req.params.type;
        const filter = { _id: new ObjectId(id) };

        const option = { upsert: true };

        const updatedDoc = req.body;

        const newDoc = {
          $set: {
            ...updatedDoc,
          },
        };

        let result;

        if (type.toLowerCase().trim() === "house") {
          result = await houseHolderCollection.updateOne(
            filter,
            newDoc,
            option
          );
        } else if (type.toLowerCase().trim() === "business") {
          result = await businessCollection.updateOne(filter, newDoc, option);
        } else if (type.toLowerCase().trim() === "villages") {
          result = await villagesCollection.updateOne(filter, newDoc, option);
        } else if (type.toLowerCase().trim() === "users") {
          result = await usersCollection.updateOne(filter, newDoc, option);
        }

        ////
        else if (type.toLowerCase().trim() === "tax") {
          result = await taxCollection.updateOne(filter, newDoc, option);
        } else if (type.toLowerCase().trim() === "settings") {
          result = await settingsCollection.updateOne(filter, newDoc, option);
        }

        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    /*
     * DELETE METHODS
     */

    // delete a specific document from a collection based on type
    // [house, business, villages, user, homeTax, businessTax]
    app.delete("/collection/:type/:id", async (req, res) => {
      try {
        const { type, id } = req.params;
        const query = { _id: new ObjectId(id) };
        let result;

        if (type.toLowerCase().trim() === "house") {
          result = await houseHolderCollection.deleteOne(query);
        } else if (type.toLowerCase().trim() === "business") {
          result = await businessCollection.deleteOne(query);
        } else if (type.toLowerCase().trim() === "villages") {
          result = await villagesCollection.deleteOne(query);
        } else if (type.toLowerCase().trim() === "users") {
          result = await usersCollection.deleteOne(query);
        }

        ////
        else if (type.toLowerCase().trim() === "tax") {
          result = await taxCollection.deleteOne(query);
        } else if (type.toLowerCase().trim() === "settings") {
          result = await settingsCollection.deleteOne(query);
        }
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("users").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server Running...");
});

app.listen(port, () => {
  console.log("Server Running");
});
