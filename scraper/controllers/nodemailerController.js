const nodemailer = require('nodemailer');

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
        user: 'sofiensghaier2@gmail.com', // Your email address
        pass: 'pxshsfqlcobrubkh', // Your email password
    },
});

// Define a function to send emails
const sendEmail = async (req, res) => {
    const { name, email, message } = req.body;

    // Create an email message
    const mailOptions = {
        from:  email,
        to:'sofiensghaier2@gmail.com', // Your Gmail account
        subject: name,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    try {
        // Send the email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
};

module.exports = { sendEmail };
