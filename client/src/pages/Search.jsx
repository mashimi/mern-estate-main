import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [searchData, setSearchData] = useState({
    searchTerm: '',
    terrainType: 'all',
    minPrice: '',
    maxPrice: '',
    hasWaterSupply: false,
    hasToilets: false,
    hasPowerSupply: false,
    allowsRVs: false,
    sort: 'created_at',
    order: 'desc',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const terrainTypeFromUrl = urlParams.get('terrainType');
    const minPriceFromUrl = urlParams.get('minPrice');
    const maxPriceFromUrl = urlParams.get('maxPrice');
    const hasWaterSupplyFromUrl = urlParams.get('hasWaterSupply');
    const hasToiletsFromUrl = urlParams.get('hasToilets');
    const hasPowerSupplyFromUrl = urlParams.get('hasPowerSupply');
    const allowsRVsFromUrl = urlParams.get('allowsRVs');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      terrainTypeFromUrl ||
      minPriceFromUrl ||
      maxPriceFromUrl ||
      hasWaterSupplyFromUrl ||
      hasToiletsFromUrl ||
      hasPowerSupplyFromUrl ||
      allowsRVsFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSearchData({
        searchTerm: searchTermFromUrl || '',
        terrainType: terrainTypeFromUrl || 'all',
        minPrice: minPriceFromUrl || '',
        maxPrice: maxPriceFromUrl || '',
        hasWaterSupply: hasWaterSupplyFromUrl === 'true',
        hasToilets: hasToiletsFromUrl === 'true',
        hasPowerSupply: hasPowerSupplyFromUrl === 'true',
        allowsRVs: allowsRVsFromUrl === 'true',
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      if (data.length > 8) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    if (
      e.target.id === 'hasWaterSupply' ||
      e.target.id === 'hasToilets' ||
      e.target.id === 'hasPowerSupply' ||
      e.target.id === 'allowsRVs'
    ) {
      setSearchData({
        ...searchData,
        [e.target.id]: e.target.checked,
      });
      return;
    }

    setSearchData({
      ...searchData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', searchData.searchTerm);
    urlParams.set('terrainType', searchData.terrainType);
    urlParams.set('minPrice', searchData.minPrice);
    urlParams.set('maxPrice', searchData.maxPrice);
    urlParams.set('hasWaterSupply', searchData.hasWaterSupply);
    urlParams.set('hasToilets', searchData.hasToilets);
    urlParams.set('hasPowerSupply', searchData.hasPowerSupply);
    urlParams.set('allowsRVs', searchData.allowsRVs);
    urlParams.set('sort', searchData.sort);
    urlParams.set('order', searchData.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };

  return (
    <div className='flex flex-col md:flex-row'>
      <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          <div className='flex items-center gap-2'>
            <label className='whitespace-nowrap font-semibold'>Search Term:</label>
            <input
              type='text'
              id='searchTerm'
              placeholder='Search...'
              className='border rounded-lg p-3 w-full'
              value={searchData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Terrain Type:</label>
            <select
              id='terrainType'
              className='border rounded-lg p-3'
              onChange={handleChange}
              value={searchData.terrainType}
            >
              <option value='all'>All</option>
              <option value='forest'>Forest</option>
              <option value='mountain'>Mountain</option>
              <option value='lake'>Lake</option>
              <option value='beach'>Beach</option>
              <option value='desert'>Desert</option>
              <option value='river'>River</option>
            </select>
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Amenities:</label>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='hasWaterSupply'
                className='w-5'
                onChange={handleChange}
                checked={searchData.hasWaterSupply}
              />
              <span>Water Supply</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='hasToilets'
                className='w-5'
                onChange={handleChange}
                checked={searchData.hasToilets}
              />
              <span>Toilets</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='hasPowerSupply'
                className='w-5'
                onChange={handleChange}
                checked={searchData.hasPowerSupply}
              />
              <span>Power Supply</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='allowsRVs'
                className='w-5'
                onChange={handleChange}
                checked={searchData.allowsRVs}
              />
              <span>RV Friendly</span>
            </div>
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Price per night:</label>
            <div className='flex gap-2'>
              <input
                type='number'
                id='minPrice'
                className='border rounded-lg p-3'
                placeholder='Min price'
                onChange={handleChange}
                value={searchData.minPrice}
              />
              <input
                type='number'
                id='maxPrice'
                className='border rounded-lg p-3'
                placeholder='Max price'
                onChange={handleChange}
                value={searchData.maxPrice}
              />
            </div>
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Sort:</label>
            <select
              id='sort'
              className='border rounded-lg p-3'
              onChange={handleChange}
              value={searchData.sort}
            >
              <option value='created_at'>Latest</option>
              <option value='pricePerNight_desc'>Price high to low</option>
              <option value='pricePerNight_asc'>Price low to high</option>
            </select>
          </div>
          <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
            Search
          </button>
        </form>
      </div>
      <div className='flex-1'>
        <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>
          Camping Spot Results:
        </h1>
        <div className='p-7 flex flex-wrap gap-4'>
          {!loading && listings.length === 0 && (
            <p className='text-xl text-slate-700'>No camping spots found!</p>
          )}
          {loading && (
            <p className='text-xl text-slate-700 text-center w-full'>
              Loading...
            </p>
          )}

          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className='text-green-700 hover:underline p-7 text-center w-full'
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
