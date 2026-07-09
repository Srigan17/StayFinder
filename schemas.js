const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow("", null)
        }),
        category: Joi.string()
            .valid(
                "Beach",
                "Mountains",
                "Camping",
                "Arctic",
                "Desert",
                "Forest",
                "Lake",
                "City",
                "Countryside",
                "Historical",
                "Castle",
                "Farm",
                "Luxury",
                "Adventure"
            )

    }).required()
});

module.exports = { listingSchema };

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
}).required();