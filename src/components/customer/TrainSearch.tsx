import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  Train,
  ArrowRight,
  Filter,
  Star
} from 'lucide-react';
import LocalStorageManager from '../../utils/localStorage';
import { Train as TrainType, SearchFilters } from '../../types';
import { getAllTrains } from '../../services/trainAPI';

interface TrainSearchProps {
  onBookTrain: (train: TrainType, selectedClass: string) => void;
}

const TrainSearch: React.FC<TrainSearchProps> = ({ onBookTrain }) => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    from: '',
    to: '',
    date: '',
    class: '',
    passengers: 1
  });
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [searchResults, setSearchResults] = useState<TrainType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trainData = LocalStorageManager.getTrains();
    setTrains(trainData);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setHasSearched(true);

  try {
    // 1️⃣  fetch live data
    const response = await getAllTrains();
    const apiTrains = response.$values;

    // 2️⃣  map the API shape ➜ the TrainType shape your UI expects
    const mapped: TrainType[] = apiTrains.map((t: any) => ({
      id: t.id,
      name: t.name,
      number: t.number,
      route: {
        from: t.routeFrom,
        to: t.routeTo,
        via: t.trainRouteVia?.$values?.map((v: any) => v.via) || []
      },
      schedule: {
        // take the first schedule for now (you can refine later)
        departure: t.schedules?.$values?.[0]?.departureTime || '',
        arrival:   t.schedules?.$values?.[0]?.arrivalTime   || '',
        duration:  '' // optional – calculate if needed
      },
      classes: t.trainClasses?.$values?.reduce((acc: any, cls: any) => {
        acc[cls.className] = {
          totalSeats:     cls.totalSeats,
          availableSeats: cls.availableSeats,
          price:          cls.price
        };
        return acc;
      }, {}) || {},
      status: t.status,
      amenities: [], // add mapping if the API ever returns amenities
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      vehicleId: t.vehicleId,
      driverId: t.driverId
    }));

    setTrains(mapped);

    // 3️⃣  keep the existing client-side filtering unchanged
    let results = mapped.filter((train) => train.status === 'active');

    if (searchFilters.from) {
      results = results.filter((train) =>
        train.route.from.toLowerCase().includes(searchFilters.from.toLowerCase())
      );
    }

    if (searchFilters.to) {
      results = results.filter((train) =>
        train.route.to.toLowerCase().includes(searchFilters.to.toLowerCase())
      );
    }

    if (searchFilters.class) {
      results = results.filter(
        (train) =>
          train.classes[searchFilters.class]?.availableSeats >= searchFilters.passengers
      );
    }

    setSearchResults(results);
  } catch (err) {
    console.error(err);
    // optionally show toast / error message here
    setSearchResults([]);
  } finally {
    setLoading(false);
  }
};

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const getAvailableClasses = (train: TrainType) => {
    return Object.entries(train.classes)
      .filter(([_, classData]) => classData.availableSeats >= searchFilters.passengers)
      .map(([className, classData]) => ({ className, ...classData }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Trains</h1>
          <p className="text-gray-600 mt-2">Find the perfect train for your journey</p>
        </div>

        {/* Search Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Departure city"
                    value={searchFilters.from}
                    onChange={(e) => handleFilterChange('from', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Destination city"
                    value={searchFilters.to}
                    onChange={(e) => handleFilterChange('to', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={searchFilters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  value={searchFilters.class}
                  onChange={(e) => handleFilterChange('class', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  <option value="First Class">First Class</option>
                  <option value="Business Class">Business Class</option>
                  <option value="Economy Class">Economy Class</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passengers
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={searchFilters.passengers}
                    onChange={(e) => handleFilterChange('passengers', parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {loading ? 'Searching...' : 'Search Trains'}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for trains...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((train) => (
                <div key={train.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Train className="h-6 w-6 text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-900">{train.name}</h3>
                        <span className="text-gray-500">({train.number})</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {train.route.from} <ArrowRight className="h-3 w-3 inline mx-1" /> {train.route.to}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {train.schedule.departure} - {train.schedule.arrival}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Duration: {train.schedule.duration}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {train.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-96">
                      <div className="space-y-3">
                        {getAvailableClasses(train).map(({ className, availableSeats, price }) => (
                          <div key={className} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{className}</p>
                              <p className="text-sm text-gray-600">{availableSeats} seats available</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">${price}</p>
                              <button
                                onClick={() => onBookTrain(train, className)}
                                className="mt-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Train className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No trains found for your search criteria</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Enter your travel details to search for trains</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainSearch;