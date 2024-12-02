import { useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    location: '',
    pricePerNight: 50,
    discountPrice: 0,
    maxGuests: 4,
    terrainType: 'forest',
    amenities: [],
    activities: [],
    hasWaterSupply: false,
    hasToilets: false,
    allowsRVs: false,
    hasPowerSupply: false,
    seasonalAvailability: ['summer'],
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log(formData);
  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (
      e.target.id === 'hasWaterSupply' ||
      e.target.id === 'hasToilets' ||
      e.target.id === 'allowsRVs' ||
      e.target.id === 'hasPowerSupply'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (e.target.id === 'amenities' || e.target.id === 'activities' || e.target.id === 'seasonalAvailability') {
      const values = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({
        ...formData,
        [e.target.id]: values,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
      if (+formData.pricePerNight < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      setLoading(true);
      setError(false);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Create a Listing
      </h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='Name'
            className='border p-3 rounded-lg'
            id='name'
            maxLength='62'
            minLength='10'
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type='text'
            placeholder='Description'
            className='border p-3 rounded-lg'
            id='description'
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type='text'
            placeholder='Location'
            className='border p-3 rounded-lg'
            id='location'
            required
            onChange={handleChange}
            value={formData.location}
          />
          <div className='flex gap-6 flex-wrap'>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='hasWaterSupply'
                className='w-5'
                onChange={handleChange}
                checked={formData.hasWaterSupply}
              />
              <span>Water Supply</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='hasToilets'
                className='w-5'
                onChange={handleChange}
                checked={formData.hasToilets}
              />
              <span>Toilets</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='allowsRVs'
                className='w-5'
                onChange={handleChange}
                checked={formData.allowsRVs}
              />
              <span>RV Friendly</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='hasPowerSupply'
                className='w-5'
                onChange={handleChange}
                checked={formData.hasPowerSupply}
              />
              <span>Power Supply</span>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-semibold'>Terrain Type:</p>
            <select
              id='terrainType'
              className='border p-3 rounded-lg'
              onChange={handleChange}
              value={formData.terrainType}
            >
              <option value='forest'>Forest</option>
              <option value='mountain'>Mountain</option>
              <option value='lake'>Lake</option>
              <option value='beach'>Beach</option>
              <option value='desert'>Desert</option>
              <option value='river'>River</option>
            </select>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-semibold'>Amenities:</p>
            <select
              multiple
              id='amenities'
              className='border p-3 rounded-lg'
              onChange={handleChange}
              value={formData.amenities}
            >
              <option value='fire-pit'>Fire Pit</option>
              <option value='picnic-table'>Picnic Table</option>
              <option value='bbq-grill'>BBQ Grill</option>
              <option value='shower'>Shower</option>
              <option value='wifi'>WiFi</option>
              <option value='trash'>Trash Service</option>
            </select>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-semibold'>Activities:</p>
            <select
              multiple
              id='activities'
              className='border p-3 rounded-lg'
              onChange={handleChange}
              value={formData.activities}
            >
              <option value='hiking'>Hiking</option>
              <option value='fishing'>Fishing</option>
              <option value='swimming'>Swimming</option>
              <option value='biking'>Biking</option>
              <option value='wildlife'>Wildlife Watching</option>
              <option value='kayaking'>Kayaking</option>
            </select>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-semibold'>Seasonal Availability:</p>
            <select
              multiple
              id='seasonalAvailability'
              className='border p-3 rounded-lg'
              onChange={handleChange}
              value={formData.seasonalAvailability}
            >
              <option value='spring'>Spring</option>
              <option value='summer'>Summer</option>
              <option value='fall'>Fall</option>
              <option value='winter'>Winter</option>
            </select>
          </div>
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <div className='flex flex-col gap-2'>
            <p className='font-semibold'>Max Guests:</p>
            <input
              type='number'
              id='maxGuests'
              min='1'
              max='20'
              required
              className='border p-3 rounded-lg'
              onChange={handleChange}
              value={formData.maxGuests}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-semibold'>Price per night:</p>
            <input
              type='number'
              id='pricePerNight'
              min='1'
              max='10000'
              required
              className='border p-3 rounded-lg'
              onChange={handleChange}
              value={formData.pricePerNight}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-semibold'>Discounted price:</p>
            <input
              type='number'
              id='discountPrice'
              min='0'
              max='10000'
              required
              className='border p-3 rounded-lg'
              onChange={handleChange}
              value={formData.discountPrice}
            />
          </div>
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-600 ml-2'>
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className='flex gap-4'>
            <input
              onChange={(e) => setFiles(e.target.files)}
              className='p-3 border border-gray-300 rounded w-full'
              type='file'
              id='images'
              accept='image/*'
              multiple
            />
            <button
              type='button'
              disabled={uploading}
              onClick={handleImageSubmit}
              className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p className='text-red-700 text-sm'>
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className='flex justify-between p-3 border items-center'
              >
                <img
                  src={url}
                  alt='listing image'
                  className='w-20 h-20 object-contain rounded-lg'
                />
                <button
                  type='button'
                  onClick={() => handleRemoveImage(index)}
                  className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Creating...' : 'Create listing'}
          </button>
          {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
      </form>
    </main>
  );
}
