const express = require('express')
const app = express();
var path = require('path')
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');


app.use(express.json())
app.use(cors())
app.set('port', 3000)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})


const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://offorb23:Onyedikachi1@afterschoolcluster.cjbk6.mongodb.net/', (err, client) => {
    db = client.db('school');
})


app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collections/messages')
}) 

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

//middleware requesting url
app.use((req, res, next) => {
    console.log("Incoming Request : " + req.url);
    next();
})

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if(e) return next(e)
        res.send(results)
    })
})

//post to orders
app.post('/collection/:collectionName', (req, res, next) => {
    const Orders = req.body;
    req.collection.insertOne(Orders).then((_) => { res.status(200).send({
        status: true,
        message: "Order submitted",
    });
    }).catch((err) => { res.status(404).send({
       // status: false,
        message: "Can't submit Order due to error"
    });
    });
})



app.put("/collection/:collectionName", (req, res, next) => {
    const products = req.body.products;
    let ItemCount = 0;
    products.forEach((lesson) => {
        req.collection.findOne({ _id: new ObjectID(lesson._id), }).then((existingProduct) => {
            existingProduct.spaces -= lesson.spaces;
            return existingProduct;
        }).then((existingProduct) => {
            return req.collection.updateOne(
                {
                    _id: new ObjectID(lesson._id),
                },
                {
                    $set: {
                        spaces: existingProduct.spaces,
                    },
                }, (err, res) => {
                    if (err) console.error(err);
                }
            );
        }).then(() => {
            ItemCount++;
            if (ItemCount == products.length) {
                res.send({
                    message: `${ ItemCount } Lesson updated successfully`,
                    status: true,
                });
            }
        }).catch((err) => {
            console.error(err);
        });
    });

})

app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {
            _id: ObjectID(req.params.id)
        }, (e, result) => {
            if(e) return next(e)
            res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
        }
    )
})




const port = process.env.PORT || 3000
app.listen(port)