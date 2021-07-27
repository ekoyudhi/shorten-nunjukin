mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const got = require('got');

const DATABASE = 'mongodb+srv://'+ process.env.USER +':'+ process.env.PASSWORD +'@'+ process.env.MONGO_URL
mongoose.connect(DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('error', (err) => {
  console.log("Mongoose Connection error" + err.message);
});

mongoose.connection.once('open', () => {
  console.log("MongoDB connected");
});

require('../models/Url');

const fs = require('fs');

const Url = mongoose.model('Url');

router.get('/', (req, res) => {
  res.render('home');
})

router.post('/', async (req, res) => {
  const url = req.body.url;
  const instance = new Url({
    url: url,
    visitors: 0
  });
  short = JSON.stringify(instance._id)
  const id = short.slice(short.length-7, short.length-1)
  instance.id = id;
  await instance.save()
  res.send({
    message: `${id} was created`,
    url: `${id}`,
  });
})

router.get('/captcha', (req, res) => {
  res.render('captcha');
});
router.post('/captcha', async (req, res) => {
  const url = req.body.url;
  const captcha = req.body.captcha;
  const params = {secret : "6Lc5csIbAAAAAJVDT0Mzetg2UoTRufbyuH1xPnZp", response : captcha}
  const { body } = await got.post('https://www.google.com/recaptcha/api/siteverify', {
        json : {
          secret : '6Lc5csIbAAAAAJVDT0Mzetg2UoTRufbyuH1xPnZp',
          response : captcha
        },
        responseType : 'json'
  });
  if (body.success == true) {
    const instance = new Url({
      url: url,
      visitors: 0
    });
    short = JSON.stringify(instance._id)
    const id = short.slice(short.length-7, short.length-1)
    instance.id = id;
    (async() => {await instance.save()});
    res.send({
      message: `${id} was created`,
      url: `${id}`,
    });
  }
})
  /*
  const url = req.body.url;
  const instance = new Url({
    url: url,
    visitors: 0
  });
  short = JSON.stringify(instance._id)
  const id = short.slice(short.length-7, short.length-1)
  instance.id = id;
  await instance.save()
  res.send({
    message: `${id} was created`,
    url: `${id}`,
  });
  */


router.get('/:route', async (req, res) => {
  const route = req.params.route;
  const instance = await Url.findOne({id: route});
  if(instance) {
    instance.visitors = instance.visitors + 1;
    await instance.save();
    res.redirect(`${instance.url}`)
  } else {
    res.send("404")
  }
})

router.get('/analytics/:route', async (req, res) => {
  res.render('count');
  /*
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  fs.readFile('../views/count.html', null, function (error, data) {
    if (error) {
      res.writeHead(404);
      res.write('Route not found!');
    } else {
      res.write(data);
    }
    res.end();
  });
  */
})

router.post('/analytics', async (req, res) => {
  const route = req.body.route;
  const instance = await Url.findOne({id: route});
  res.send({
    visitors: instance.visitors,
    message: "Number of visitors sent!"
  })
})

module.exports = router;