// Define routes for simple SSJS web app. 
// Writes Coinbase orders to database.
var async   = require('async')
  , express = require('express')
  , fs      = require('fs')
  , http    = require('http')
  , https   = require('https')
  , db      = require('./models')
  , path    = require('path')
  , nodemailer = require('nodemailer');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8080);

// use stylesheet folder
// app.use("/css", express.static(__dirname + '/css'));
app.use(express.static(path.join(__dirname, 'public')));

//  Use bodyParser for form
app.use(express.bodyParser());
    

// Render homepage (note trailing slash): example.com/
app.get('/', function(request, response) {
    // var data = fs.readFileSync('index.html').toString();
    // response.send(data);
    // index request for numbers and percentages
    global.db.Order.findAll().success(function(orders) {
	var orders_json = [];
	orders.forEach(function(order) {
	    orders_json.push({id: order.coinbase_id, amount: order.amount, time: order.time});
	});
	// Uses views/index.ejs?
	response.render("index", {orders: orders_json});
    }).error(function(err) {
	console.log(err);
	response.send("error retrieving orders");
    });
});

// Render example.com/orders
app.get('/orders', function(request, response) {
  global.db.Order.findAll().success(function(orders) {
    var orders_json = [];
    orders.forEach(function(order) {
      orders_json.push({id: order.coinbase_id, amount: order.amount, time: order.time});
    });
    // Uses views/orders.ejs
    response.render("orders", {orders: orders_json});
  }).error(function(err) {
    console.log(err);
    response.send("error retrieving orders");
  });
});

// Hit this URL while on example.com/orders to refresh
app.get('/refresh_orders', function(request, response) {
  https.get("https://coinbase.com/api/v1/orders?api_key=" + process.env.COINBASE_API_KEY, function(res) {
    var body = '';
    res.on('data', function(chunk) {body += chunk;});
    res.on('end', function() {
      try {
        var orders_json = JSON.parse(body);
        if (orders_json.error) {
          response.send(orders_json.error);
          return;
        }
        // add each order asynchronously
        async.forEach(orders_json.orders, addOrder, function(err) {
          if (err) {
            console.log(err);
            response.send("error adding orders");
          } else {
            // orders added successfully
            response.redirect("/orders");
          }
        });
      } catch (error) {
        console.log(error);
        response.send("error parsing json");
      }
    });

    res.on('error', function(e) {
      console.log(e);
      response.send("error syncing orders");
    });
  });

});

// sync the database and start the server
db.sequelize.sync().complete(function(err) {
  if (err) {
    throw err;
  } else {
    http.createServer(app).listen(app.get('port'), function() {
      console.log("Listening on " + app.get('port'));
    });
  }
});

// add order to the database if it doesn't already exist
var addOrder = function(order_obj, callback) {
  var order = order_obj.order; // order json from coinbase
  if (order.status != "completed") {
    // only add completed orders
    callback();
  } else {
    var Order = global.db.Order;
    // find if order has already been added to our database
    Order.find({where: {coinbase_id: order.id}}).success(function(order_instance) {
      if (order_instance) {
        // order already exists, do nothing
        callback();
      } else {
        // build instance and save
          var new_order_instance = Order.build({
          coinbase_id: order.id,
          amount: order.total_btc.cents / 100000000, // convert satoshis to BTC
          time: order.created_at
        });
          new_order_instance.save().success(function() {
          callback();
        }).error(function(err) {
          callback(err);
        });
      }
    });
  }
};

// nodemailer functionality
/*
app.get('/contact', function(request, response) {
    response.render('contact', { title: 'AppLoquent - Contact', page: 'contact' })
});
*/

app.post('/contact', function (req, res) {
    var mailOpts, smtpTrans;
    smtpTrans = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: {
            user: "shenan1984@gmail.com",
            pass: "cmmhemavyierbfgx"
	}
    });
    //Mail options
    mailOpts = {
	from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
	to: 'shenan1984@gmail.com',
	subject: 'AppLoquent contact form',
	text: req.body.message
   };
    smtpTrans.sendMail(mailOpts, function (error, response) {
      //Email not sent
      if (error) {
	  res.render('/contact', { msg: 'Error occured, message not sent.', err: true, page: 'contact' })
      }
      //Yay!! Email sent
	else {
	    res.render('/contact', { msg: 'Message sent! Thank you.', err: false, page: 'contact' })
	}
    });
});
