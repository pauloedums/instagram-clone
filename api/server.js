var express = require('express'), 
    bodyParser = require('body-parser'), 
    multiparty = require('connect-multiparty'),
    mongodb = require('mongodb'),
    objectId = require('mongodb').ObjectId,
    fs = require('fs');


    var app = express();

    app.use(bodyParser.urlencoded({extended:true}));
    app.use(bodyParser.json());
    app.use(multiparty());

    var port = 8080;
    app.listen(port);

    var db = new mongodb.Db(
        'instagram',
        new mongodb.Server('localhost', 27017, {}),
        {}
    )

    console.log('Servidor HTTP esta escutando na porta ' + port);

    app.get('/', (req, res) => {
      res.send({ msg: 'Olá'});
    });

// CREATE
app.post('/api', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');

    var date = new Date();

    var timestamp = date.getTime();

    var path_origem = req.files.arquivo.path;

    var url_image = timestamp + '_' + req.files.arquivo.originalFilename;

    var path_destino = './uploads' + url_image;


    fs.rename(path_origem, path_destino, (err) => {
        if(err) {
            res.status(500).json({ error: err})
            return;
        }

        var dados = {
            url_imagem: url_image,
            titulo: req.body.titulo
        };

        db.open((err, mongoclient) => {
            mongoclient.collection('postagens', (err, collection) => {
                collection.insert(dados, (err, records) => {
                    if(err) {
                        res.json({'status': 'erro'});
                    }else {
                        res.json({'status': 'inclusão realizada com sucesso'});
                    }
                    mongoclient.close();
                })
            })
        });
    });
    
    
})

// GET
app.get('/api', (req, res) => {        
    db.open((err, mongoclient) => {
        mongoclient.collection('postagens', (err, collection) => {
        collection.find().toArray((err, results) => {
            if(err) {
                res.json(err);
            } else{
                res.json(results);
            }
            mongoclient.close();
        })
        })
    });
})

// GET - BY ID
app.get('/api/:id', (req, res) => {
    db.open((err, mongoclient) => {
        mongoclient.collection('postagens', (err, collection) => {
            collection.find(objectId(req.params.id)).toArray((err, results) => {
            if(err) {
                res.json(err);
                } else{
                    res.status(200).json(results);
                }
                mongoclient.close();
            })
        })
    });
});



// UPDATE BY ID
app.put('/api/:id', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');

    var dados = req.body;
    
    db.open((err, mongoclient) => {
        mongoclient.collection('postagens', (err, collection) => {
            collection.update(
                { _id: objectId(req.params.id) },
                { $set: {titulo: req.body.titulo }},
                {},
                (err, records) => {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close();
                }
            );
        })
    });
})

// DELETE BY ID
app.delete('/api/:id', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');

    var dados = req.body;
    
    db.open((err, mongoclient) => {
        mongoclient.collection('postagens', (err, collection) => {
            collection.remove(
                { _id: objectId(req.params.id) },
                (err, records) => {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close(); 
                }
            );
        })
    });
});