const mongoose = require("mongoose");

const ZipcodeSchema = new mongoose.Schema(
	{
		zipcode: {
			type: String,
			required: true,
			unique: true,
		},
		popdensity: {
			type: Number,
			required: false,
			unique: false,
		},
		lat: {
            type: Number,
            required: false,
            unique: false
        },
        long: {
            type: Number,
            required: false,
            unique: false
        },
        windspeed: {
            type: Number,
            required: false,
            unique: false
        },
        precip: {
            type: Number,
            required: false,
            unique: false
        },
        temp: {
            type: Number,
            required: false,
            unique: false
        },
        humidity: {
            type: Number,
            required: false,
            unique: false
        },
        geojson: {
            type: [[Number]],
            required: false,
            unique: false,
        },
        lucidscore: {
            type: Number,
            required: false,
            unique: false
        }

	},
	{ collection: "Zipcodes" }
);

const ZipCode = mongoose.models.Zipcode || mongoose.model("Zipcode", ZipcodeSchema);

module.exports = ZipCode;
	