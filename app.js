// app and middleware to submit and send the contact form
var nodemailer = require('nodemailer');

app.get('/cForm', routes.cForm);

app.post('/cForm', function(req, res) {
    var mailOpts, smtpTrans;

    // setup nodemailer transport, gmail here.  create an application-specific password to avoid problems
    smtpTrans = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: {
	    user: "shenan1984@gmail.com",
	    pass: "cmmhemavyierbfgx"
	}
    });

    // mail options
    mailOpts = {
	from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data
	to: 'panda@panduins.com',
	subject: 'AppLoquent Contact Form',
	text: req.body.message
    };

    smtpTrans.sendMail(mailOpts, function(error, response) {
	// Email not sent
	if(error) {
	    res.render('cForm', { title: 'AppLoquent Contact Form', msg: 'Error occured, message not sent.', err: true, page: 'cForm' })
	}
	// Email sent
	else {
	    res.render('cForm', { title: 'AppLoquent Contact Form', msg: 'Message sent! Thank you.', err: false, page: 'cForm' })
	}
    });
});
