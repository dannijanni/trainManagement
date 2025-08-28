import React, { useState, useEffect } from 'react';
import { Search, Train, ArrowRight, MapPin, Calendar } from 'lucide-react';
import { getAllTrains } from '../../services/trainAPI';
import { Train as TrainType } from '../../types';

interface TrainSearchProps {
  onBookTrain: (train: TrainType, selectedClass: string) => void;
}

const TrainSearch: React.FC<TrainSearchProps> = ({ onBookTrain }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [searchResults, setSearchResults] = useState<TrainType[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-load trains on page open
  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      try {
        const response = await getAllTrains();
        const apiTrains = response.$values;
        const mapped: TrainType[] = apiTrains.map((t: any) => ({
          id: t.id,
          name: t.name,
          number: t.number,
          route: {
            from: t.routeFrom,
            to: t.routeTo,
            via: t.trainRouteVia?.$values?.map((v: any) => v.via) || [],
          },
          schedule: {
            departure: t.schedules?.$values?.[0]?.departureTime || '',
            arrival: t.schedules?.$values?.[0]?.arrivalTime || '',
            duration: '',
          },
          classes: t.trainClasses?.$values?.reduce((acc: any, cls: any) => {
            acc[cls.className] = {
              totalSeats: cls.totalSeats,
              availableSeats: cls.availableSeats,
              price: cls.price,
            };
            return acc;
          }, {}),
          status: t.status,
          amenities: [],
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          vehicleId: t.vehicleId,
          driverId: t.driverId,
        }));
        setTrains(mapped);
        setSearchResults(mapped);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrains();
  }, []);

  // Filter trains as you type
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(trains);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = trains.filter(
      (train) =>
        train.name.toLowerCase().includes(query) ||
        train.number.toLowerCase().includes(query) ||
        train.route.from.toLowerCase().includes(query) ||
        train.route.to.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery, trains]);

  const getAvailableClasses = (train: TrainType) => {
    return Object.entries(train.classes).map(([className, classData]) => ({
      className,
      ...classData,
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Trains</h1>
          <p className="text-gray-600 mt-2">Find your train by name, number, or route</p>
        </div>

        {/* Single Search Box */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by train name, number, or route (e.g., Lahore to Karachi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trains...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((train) => (
              <div key={train.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Train className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">{train.name}</h3>
                      <span className="text-gray-500">({train.number})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {train.route.from} <ArrowRight className="h-3 w-3 inline mx-1" /> {train.route.to}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {train.schedule.departure} - {train.schedule.arrival}
                        </span>
                      </div>
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
                            <p className="text-lg font-bold text-gray-900">£{price}</p>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Train className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No trains found</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchQuery ? 'Try a different search term' : 'Start typing to search for trains'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainSearch;
