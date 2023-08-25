const nodemailer = require("nodemailer");

module.exports = class OnceMailer {
    static async getTestTransporter() {
        let testAccount = await nodemailer.createTestAccount();

        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    static get DefaultTransporter() {
        return nodemailer.createTransport({
            host: ONCE.ENV.ONCE_MAIL_HOST,
            port: Number.parseInt(ONCE.ENV.ONCE_MAIL_PORT),
            secure: ONCE.ENV.ONCE_MAIL_SECURE.toLowerCase() === 'true',
            auth: {
                user: ONCE.ENV.ONCE_MAIL_USER,
                pass: ONCE.ENV.ONCE_MAIL_PASSWORD,
            },
        });
    }

    createTransport(config){
        return nodemailer.createTransport(config)
    }

    async sendMail(mail, transporter = OnceMailer.DefaultTransporter) {
        mail.from = mail.from ? mail.from : ONCE.ENV.ONCE_MAIL_FROM
        return await transporter.sendMail(mail);
    }

    async sendTestMail() {
        let info = await this.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: "bar@example.com, baz@example.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        }, await OnceMailer.getTestTransporter())
        console.debug("Message sent: %s", info.messageId);
        console.debug("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return nodemailer.getTestMessageUrl(info)
    }
}