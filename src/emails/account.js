const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* sgMail.send({
  to: "vish28208@gmail.com",
  from: "vish28208@gmail.com",
  subject: "This is my first creation!",
  text: "I hope this one actually get to you."
}); */

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "vish28208@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome  to the app, ${name}. Let me know how you get along with the app.`
  });
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "vish28208@gmail.com",
    subject: "Sorry to see you go!",
    text: `Goodbye, ${name}. I hope to see you soon.`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail
};