// form mailer from http://blog.ragingflame.co.za/2012/6/28/simple-form-handling-with-express-and-nodemailer
exports.cForm = function(req, res) {
    res.render('contact', { title: 'AppLoquent Contact Form' })
};
