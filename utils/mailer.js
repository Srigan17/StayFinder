const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(email, username) {
    await resend.emails.send({
        from: "Haven Stay <noreply@havenstay.site>",
        to: email,
        subject: "🏡 Welcome to Haven Stay!",
        html: `
            <h2>Welcome, ${username}! 👋</h2>

            <p>Thank you for joining <strong>Haven Stay</strong>.</p>

            <p>
            We're excited to have you as part of our growing community. Whether you're
            planning your next vacation or looking for the perfect place to stay,
            Haven Stay is here to make your journey memorable.
            </p>

            <p style="text-align:center; margin-top: 30px;">
                <a href="https://havenstay.site"
                   style="background:#2E8B57;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
                    Explore Haven Stay
                </a>
            </p>

            <hr style="border:none; border-top:1px solid #ddd; margin:0 0 35px 0;">

            <p>
            Hi <strong>${username}</strong>,
            </p>

            <p>
            I'm <strong>Murari</strong>, the founder of Haven Stay. Thank you for giving
            our platform a try. I built Haven Stay with the goal of making it simple,
            reliable, and enjoyable to discover great places to stay.
            </p>

            <p>
            Your support means a lot, and I hope Haven Stay becomes a part of many of your
            future adventures. If you have any suggestions or feedback, I'd love to hear
            from you.
            </p>

            <p>Happy Travels! ✈️</p>

            <p>
            Warm regards,<br>
            <strong>Murari</strong><br>
            Founder, Haven Stay
            </p>
        `
    });
}

module.exports = sendWelcomeEmail;
