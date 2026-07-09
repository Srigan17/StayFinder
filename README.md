# 🏡 StayFinder

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logoColor=white)

![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logoColor=black)
![Google_Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)

</div>

---

# 📖 Overview

StayFinder is a full-stack vacation rental web application that enables users to discover, explore, and manage rental properties through a clean and responsive interface.

Inspired by modern vacation rental platforms, the application provides secure user authentication, property management, cloud-based image storage, interactive maps, customer reviews, and AI-powered review summaries.

The project follows the MVC architecture and integrates Passport.js for authentication, Cloudinary for image management, Leaflet for location visualization, and Google Gemini to generate concise summaries of user reviews.

---

# ✨ Features

## 🔐 Authentication & Authorization

- User Registration
- User Login & Logout
- Session-Based Authentication
- Passport.js Authentication
- Protected Routes
- Owner-only Listing Management
- Author-only Review Deletion

---

## 🏠 Property Listings

- Create New Listings
- View Property Details
- Edit Existing Listings
- Delete Listings
- Category-wise Property Filtering
- My Listings Dashboard

---

## 📸 Image Upload

- Upload Property Images
- Cloudinary Image Storage
- Optimized Image Delivery
- Secure Image Hosting

---

## 🗺️ Interactive Maps

- Leaflet Maps Integration
- Property Location Display
- Dynamic Map Markers
- Interactive Navigation

---

## ⭐ Reviews

- Add Reviews
- Delete Own Reviews
- Rating System
- Customer Feedback

---

## 🤖 AI Review Summary

- Google Gemini Integration
- Automatic Review Summarization
- Overall Guest Sentiment
- Highlights Positive & Negative Feedback
- Updates Summary Whenever a New Review is Added

---

## 🎨 User Experience

- Responsive Bootstrap UI
- Mobile Friendly
- Flash Messages
- Clean Interface

---

## 🛡️ Security

- Joi Validation
- Server-side Validation
- Session Protection
- Authentication Middleware
- Error Handling Middleware
- Ownership Verification

---

# 🛠️ Tech Stack

| Layer | Technology |
|------|-------------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Frontend** | EJS, Bootstrap 5 |
| **Authentication** | Passport.js |
| **Maps** | Leaflet |
| **Image Storage** | Cloudinary |
| **Validation** | Joi |
| **AI** | Google Gemini |

---

# 📂 Project Structure

```text
StayFinder/
│
├── controller/
├── init/
├── models/
├── public/
│   ├── css/
│   └── js/
├── routes/
├── services/
├── utils/
├── views/
│   ├── includes/
│   ├── landing/
│   ├── layouts/
│   ├── listings/
│   └── users/
│
├── .env
├── app.js
├── cloudconfig.js
├── middleware.js
├── package.json
├── README.md
└── schemas.js
```

---

# ⚙️ Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/Srigan17/StayFinder.git
```

## 2. Open Project

```bash
cd StayFinder
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Create .env File

```env
ATLAS_DB_URL=your_mongodb_connection_string

SECRET=your_session_secret

CLOUD_NAME=your_cloudinary_cloud_name

CLOUD_API_KEY=your_cloudinary_api_key

CLOUD_API_SECRET=your_cloudinary_api_secret
```

## 5. Start Server

```bash
npm start
```

or

```bash
node app.js
```

## 6. Open Browser

```
http://localhost:3000
```

---
# 🤖 AI Review Summary

StayFinder uses **Google Gemini AI** to generate short and meaningful summaries of customer reviews.

Whenever a user submits a new review, the application automatically:

1. Collects all reviews of the property.
2. Sends them to Google Gemini.
3. Generates a concise summary.
4. Highlights the overall guest experience.
5. Saves the generated summary.
6. Displays the summary on the property details page.

This allows users to quickly understand customer opinions without reading every individual review.

---

# 🌐 Application Routes

## Listings

```http
GET      /listings
GET      /listings/new
POST     /listings
GET      /listings/:id
GET      /listings/:id/edit
PUT      /listings/:id
DELETE   /listings/:id
```

---

## Reviews

```http
POST     /listings/:id/reviews
DELETE   /listings/:id/reviews/:reviewId
```

---

## Users

```http
GET      /signup
POST     /signup
GET      /login
POST     /login
GET      /logout
```

---

# 🏝️ Property Categories

- Beach
- Mountains
- Camping
- Arctic
- Desert
- Forest
- Lake
- City
- Countryside
- Historical
- Castle
- Farm
- Luxury
- Adventure

---

# 🛡️ Security Features

- Secure User Authentication using Passport.js
- Session-Based Authentication
- Role-Based Authorization
- Password Hashing
- Joi Validation
- Express Error Handling Middleware
- Protected Routes
- Ownership Verification
- Secure Cloudinary Image Uploads

---

# 📸 Screenshots

You can add screenshots of your application here.

Example:

```
Home Page

Listings Page

Property Details

Login Page

Signup Page
```

---

# 🔮 Future Enhancements

- Property Booking System
- Wishlist
- Payment Gateway Integration
- Property Availability Calendar
- User Profile Pictures
- Admin Dashboard
- Advanced Search & Filters
- In-App Chat
- Real-Time Notifications
- Booking History

---

# ⚡ Performance Highlights

- MVC Architecture
- Modular Code Structure
- RESTful Routing
- Cloud Image Storage
- Interactive Maps
- AI Integration
- Responsive UI
- Server-side Validation
- Session Management
- Clean Project Organization

---
# 🤝 Contributing

Contributions are welcome!

If you would like to improve this project:

```bash
# Fork the repository

# Create a new feature branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "Add your feature"

# Push the branch
git push origin feature/your-feature-name
```

Finally, create a Pull Request.

---

# 📄 License

This project is intended for educational and learning purposes.

Feel free to use and enhance it for personal learning and academic projects.

---

# 👨‍💻 Author

## Srigan

**Computer Science Engineering Student**  
VIT University

### 📧 Email

ganakp2006@gmail.com

### 💻 GitHub

https://github.com/Srigan17

---

# 🙌 Acknowledgements

Special thanks to the open-source community and the developers of the following technologies that made this project possible:

- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- Cloudinary
- Bootstrap
- Leaflet
- Google Gemini
- Joi

---

# ⭐ Support

If you found this project helpful, consider giving it a **⭐ Star** on GitHub.

Your support is greatly appreciated!

---

# 📬 Contact

For suggestions, feedback, or collaboration:

📧 ganakp2006@gmail.com

GitHub: https://github.com/Srigan17

---

<div align="center">

## 🏡 StayFinder

**Find Your Perfect Stay, Anywhere.**

Built with ❤️ using **Node.js**, **Express.js**, **MongoDB**, **Cloudinary**, **Leaflet**, and **Google Gemini AI**.

### Thank you for visiting StayFinder!

⭐ Don't forget to star the repository if you like the project.

Happy Coding! 🚀

</div>