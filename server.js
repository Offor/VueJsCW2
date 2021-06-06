const express = require('express')
const app = express();
var path = require('path')
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');

var imagePath = path.resolve(__dirname, "images");


app.use(express.json())
app.use(cors())
app.set('port', 3000);
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



// app.put("/collection/:collectionName", (req, res, next) => {
//     const products = req.body.products;
//     products.forEach((lesson) => {
//         req.collection.findOne({ _id: new ObjectID(lesson._id), }).then((existingProduct) => {
//             let newSpace = existingProduct.spaces - lesson.spaces; 
//             newSpace.spaces = existingProduct.spaces;
//             return newSpace;
//         }).then((newSpace) => {
//             return req.collection.updateOne(
//                 {
//                     _id: new ObjectID(lesson._id),
//                 },
//                 {
//                     $set: {
//                         spaces: newSpace.spaces,
//                     },
//                 }, (err) => {
//                     if(err) console.log(err);
//                 }
//             );
//         }).then(() => {
//             let lessonCount = 0; 
//             lessonCount++;
//             if(lessonCount == products.length){
//                 res.send({
//                     message: `#{lessonCount} Lesson updated succesfully`,
//                     status: true
//                 });
//             }
//         }).catch((err) => {
//             console.log(err);
//         });
//     });

// })

app.put("/collection/:collectionName", (req, res, next) => {
    const products = req.body.products;
   let lessonCount = 0;
    products.forEach((lesson) => {
        req.collection.findOne({ _id: new ObjectID(lesson._id), }).then((exp) => {
            // let newSpace = exp.spaces - lesson.spaces;
            exp.spaces -= lesson.spaces;
            console.log(exp);
           return exp;
          
        })
        .then((exp) => {
            return req.collection.updateOne(
                { _id: new ObjectID(lesson._id), },
                {
                    $set: {
                        spaces: exp.spaces,
                    },
                }, (err, res) => {
                    if (err) console.error(err);
                }
            );
        }).then(() => {
            lessonCount++;
            if (lessonCount == products.length) {
                res.send({
                    message: 'Lesson updated',
                    status: true,
                });
            }
        }).catch((err) => {
            console.error(err);
        });
    });

})



//sends static files from the public path directory
app.use('/images', express.static(imagePath));
app.use(function(request, response,next) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Error finding image, please confirm the name");
    
});

const port = process.env.PORT || 3000
app.listen(port)