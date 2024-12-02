import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaWater, FaToilet, FaPlug, FaCar, FaCampground } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Contact from '../components/Contact';

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const handleBooking = async () => {
    if (!currentUser) {
      setBookingError('Please sign in to book');
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingError('Please select check-in and check-out dates');
      return;
    }

    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing._id,
          checkIn,
          checkOut,
          numberOfGuests,
          totalPrice,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        setBookingError(data.message);
        return;
      }
      setBookingSuccess(true);
      setBookingError(null);
    } catch (error) {
      setBookingError('Something went wrong');
    }
  };

  useEffect(() => {
    if (checkIn && checkOut && listing) {
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      setTotalPrice(nights * listing.pricePerNight);
    }
  }, [checkIn, checkOut, listing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <main>
      {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
      {error && (
        <p className='text-center my-7 text-2xl'>Something went wrong!</p>
      )}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className='h-[550px]'
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer'>
            <button onClick={handleCopy}>
              {copied ? (
                <FaCheck className='text-green-500' />
              ) : (
                <FaShare className='text-slate-500' />
              )}
            </button>
          </div>
          <div className='flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4'>
            <h1 className='text-2xl font-semibold'>{listing.name}</h1>
            <p className='flex items-center gap-2 text-slate-600'>
              <FaMapMarkerAlt className='text-green-700' />
              {listing.location}
            </p>
            <div className='flex gap-4'>
              <p className='bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                {listing.terrainType} Terrain
              </p>
              {listing.hasWaterSupply && (
                <p className='flex items-center gap-2'>
                  <FaWater className='text-blue-700' />
                  Water Supply
                </p>
              )}
              {listing.hasToilets && (
                <p className='flex items-center gap-2'>
                  <FaToilet />
                  Toilets
                </p>
              )}
              {listing.hasPowerSupply && (
                <p className='flex items-center gap-2'>
                  <FaPlug className='text-yellow-500' />
                  Power Supply
                </p>
              )}
              {listing.allowsRVs && (
                <p className='flex items-center gap-2'>
                  <FaCar />
                  RV Friendly
                </p>
              )}
            </div>
            <p className='text-slate-800'>
              <span className='font-semibold text-black'>Description - </span>
              {listing.description}
            </p>
            <div className='flex gap-4 flex-wrap'>
              <div className='flex items-center gap-2'>
                <FaCampground />
                <p>{listing.totalSpots} total spots</p>
              </div>
              <p className='font-semibold'>Max Guests: {listing.maxGuests}</p>
            </div>
            <div>
              <p className='font-semibold mb-2'>Amenities:</p>
              <div className='flex gap-4 flex-wrap'>
                {listing.amenities.map((amenity) => (
                  <span key={amenity} className='bg-slate-200 p-1 rounded-md'>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className='font-semibold mb-2'>Activities:</p>
              <div className='flex gap-4 flex-wrap'>
                {listing.activities.map((activity) => (
                  <span key={activity} className='bg-slate-200 p-1 rounded-md'>
                    {activity}
                  </span>
                ))}
              </div>
            </div>
            <div className='border p-4 rounded-lg'>
              <p className='text-2xl font-semibold text-slate-700'>
                ${listing.pricePerNight}
                <span className='text-slate-500 text-lg'> / night</span>
              </p>
              <div className='flex flex-col gap-4 my-4'>
                <div className='flex gap-4'>
                  <div>
                    <label className='font-semibold'>Check In</label>
                    <DatePicker
                      selected={checkIn}
                      onChange={(date) => setCheckIn(date)}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={new Date()}
                      className='border p-2 rounded-lg w-full'
                    />
                  </div>
                  <div>
                    <label className='font-semibold'>Check Out</label>
                    <DatePicker
                      selected={checkOut}
                      onChange={(date) => setCheckOut(date)}
                      selectsEnd
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={checkIn}
                      className='border p-2 rounded-lg w-full'
                    />
                  </div>
                </div>
                <div>
                  <label className='font-semibold'>Number of Guests</label>
                  <input
                    type='number'
                    min='1'
                    max={listing.maxGuests}
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(e.target.value)}
                    className='border p-2 rounded-lg w-full'
                  />
                </div>
                {totalPrice > 0 && (
                  <p className='text-xl font-semibold'>
                    Total: ${totalPrice}
                  </p>
                )}
                <button
                  onClick={handleBooking}
                  className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
                >
                  Book Now
                </button>
                {bookingError && (
                  <p className='text-red-700'>{bookingError}</p>
                )}
                {bookingSuccess && (
                  <p className='text-green-700'>
                    Booking successful! Check your profile for booking details.
                  </p>
                )}
              </div>
            </div>
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'
              >
                Contact Host
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
