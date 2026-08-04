const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(email, username) {
    await resend.emails.send({
        from: "StayFinder Stay <noreply@StayFinder.site>",
        to: email,
        subject: "🏡 Welcome to StayFinder Stay!",
        html: `
            <h2>Welcome, ${username}! 👋</h2>

            <p>Thank you for joining <strong>StayFinder Stay</strong>.</p>

            <p>
            We're excited to have you as part of our growing community. Whether you're
            planning your next vacation or looking for the perfect place to stay,
            StayFinder Stay is here to make your journey memorable.
            </p>

            <p style="text-align:center; margin-top: 30px;">
                <a href="https://StayFinder.site"
                   style="background:#2E8B57;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
                    Explore StayFinder Stay
                </a>
            </p>

            <hr style="border:none; border-top:1px solid #ddd; margin:0 0 35px 0;">

            <p>
            Hi <strong>${username}</strong>,
            </p>

            <p>
            I'm <strong>Srigan</strong>, the founder of StayFinder Stay. Thank you for giving
            our platform a try. I built StayFinder Stay with the goal of making it simple,
            reliable, and enjoyable to discover great places to stay.
            </p>

            <p>
            Your support means a lot, and I hope StayFinder Stay becomes a part of many of your
            future adventures. If you have any suggestions or feedback, I'd love to hear
            from you.
            </p>

            <p>Happy Travels! ✈️</p>

            <p>
            Warm regards,<br>
            <strong>Srigan</strong><br>
            Founder, StayFinder Stay
            </p>
        `
    });
}

module.exports = sendWelcomeEmail;
