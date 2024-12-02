import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: false,
    },
    amenities: {
      type: Array,
      required: true,
    },
    maxGuests: {
      type: Number,
      required: true,
    },
    terrainType: {
      type: String,
      required: true,
      enum: ['forest', 'mountain', 'lake', 'beach', 'desert', 'river']
    },
    activities: {
      type: Array,
      required: true,
    },
    hasWaterSupply: {
      type: Boolean,
      required: true,
    },
    hasToilets: {
      type: Boolean,
      required: true,
    },
    allowsRVs: {
      type: Boolean,
      required: true,
    },
    hasPowerSupply: {
      type: Boolean,
      required: true,
    },
    seasonalAvailability: {
      type: Array,
      required: true,
    },
    totalSpots: {
      type: Number,
      required: true,
      default: 1
    },
    bookedDates: [{
      date: Date,
      spotsBooked: Number
    }],
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
