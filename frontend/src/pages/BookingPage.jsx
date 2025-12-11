import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { bookingsAPI, coachesAPI, equipmentAPI } from '../services/api';

const BookingPage = ({ courts }) => {
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    user: {
      name: '',
      email: '',
      phone: ''
    }
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedCourt, selectedDate]);

  useEffect(() => {
    loadCoaches();
    loadEquipment();
  }, []);

  useEffect(() => {
    if (selectedSlot && selectedCourt) {
      calculatePrice();
    }
  }, [selectedSlot, selectedCoach, selectedEquipment, selectedCourt]);

  const loadAvailableSlots = async () => {
    if (!selectedCourt) return;
    
    setLoading(true);
    try {
      const response = await bookingsAPI.getSlots(selectedCourt._id, selectedDate);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setError('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const loadCoaches = async () => {
    try {
      const response = await coachesAPI.getAll({ active: true });
      setCoaches(response.data);
    } catch (error) {
      console.error('Failed to load coaches:', error);
    }
  };

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll({ active: true });
      setEquipment(response.data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    }
  };

  const calculatePrice = async () => {
    if (!selectedSlot || !selectedCourt) return;

    try {
      const equipmentRequests = selectedEquipment.map(eq => ({
        equipment: eq._id,
        quantity: eq.quantity || 1
      }));

      const response = await bookingsAPI.calculatePrice({
        courtId: selectedCourt._id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        equipmentRequests,
        coachId: selectedCoach?._id
      });

      setPricing(response.data);
    } catch (error) {
      console.error('Failed to calculate price:', error);
    }
  };

  const handleEquipmentChange = (equipmentId, quantity) => {
    if (quantity > 0) {
      const existingIndex = selectedEquipment.findIndex(eq => eq._id === equipmentId);
      if (existingIndex >= 0) {
        const updated = [...selectedEquipment];
        updated[existingIndex].quantity = quantity;
        setSelectedEquipment(updated);
      } else {
        const equipmentItem = equipment.find(eq => eq._id === equipmentId);
        setSelectedEquipment([...selectedEquipment, { ...equipmentItem, quantity }]);
      }
    } else {
      setSelectedEquipment(selectedEquipment.filter(eq => eq._id !== equipmentId));
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const equipmentRequests = selectedEquipment.map(eq => ({
        equipment: eq._id,
        quantity: eq.quantity
      }));

      const bookingData = {
        user: bookingForm.user,
        courtId: selectedCourt._id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        equipmentRequests,
        coachId: selectedCoach?._id
      };

      await bookingsAPI.create(bookingData);
      setBookingSuccess(true);
      
      // Reset form
      setBookingForm({ user: { name: '', email: '', phone: '' } });
      setSelectedCoach(null);
      setSelectedEquipment([]);
      setSelectedSlot(null);
      setPricing(null);
      
      // Reload slots
      loadAvailableSlots();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h2>
          <p className="text-green-700 mb-4">Your court booking has been successfully confirmed.</p>
          <button
            onClick={() => setBookingSuccess(false)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Book a Court</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Court Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Select Court
            </h2>
            <div className="space-y-2">
              {courts.map(court => (
                <button
                  key={court._id}
                  onClick={() => setSelectedCourt(court)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedCourt?._id === court._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{court.name}</div>
                  <div className="text-sm text-gray-600">
                    {court.type} • {court.sport} • ${court.basePrice}/hr
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date and Slot Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Select Date & Time
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedCourt && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {loading ? (
                    <div className="col-span-full text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                        disabled={!slot.isAvailable}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          !slot.isAvailable
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                            : selectedSlot?.startTime === slot.startTime
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {slot.timeString}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-4 text-gray-500">
                      No available slots for this date
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Additional Resources */}
          {selectedSlot && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
              
              {/* Coach Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Coach (Optional)</h3>
                <select
                  value={selectedCoach?._id || ''}
                  onChange={(e) => {
                    const coach = coaches.find(c => c._id === e.target.value);
                    setSelectedCoach(coach || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No coach</option>
                  {coaches.map(coach => (
                    <option key={coach._id} value={coach._id}>
                      {coach.name} - ${coach.hourlyRate}/hr
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Equipment</h3>
                <div className="space-y-2">
                  {equipment.map(item => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          (${item.rentalPrice}/hr)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const current = selectedEquipment.find(eq => eq._id === item._id);
                            const currentQty = current?.quantity || 0;
                            if (currentQty > 0) {
                              handleEquipmentChange(item._id, currentQty - 1);
                            }
                          }}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">
                          {selectedEquipment.find(eq => eq._id === item._id)?.quantity || 0}
                        </span>
                        <button
                          onClick={() => {
                            const current = selectedEquipment.find(eq => eq._id === item._id);
                            const currentQty = current?.quantity || 0;
                            if (currentQty < item.availableStock) {
                              handleEquipmentChange(item._id, currentQty + 1);
                            }
                          }}
                          disabled={selectedEquipment.find(eq => eq._id === item._id)?.quantity >= item.availableStock}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          {pricing && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Price Breakdown
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>${pricing.basePrice}</span>
                </div>
                {pricing.peakHourFee > 0 && (
                  <div className="flex justify-between">
                    <span>Peak Hour Fee</span>
                    <span>${pricing.peakHourFee}</span>
                  </div>
                )}
                {pricing.weekendFee > 0 && (
                  <div className="flex justify-between">
                    <span>Weekend Fee</span>
                    <span>${pricing.weekendFee}</span>
                  </div>
                )}
                {pricing.equipmentFee > 0 && (
                  <div className="flex justify-between">
                    <span>Equipment Fee</span>
                    <span>${pricing.equipmentFee}</span>
                  </div>
                )}
                {pricing.coachFee > 0 && (
                  <div className="flex justify-between">
                    <span>Coach Fee</span>
                    <span>${pricing.coachFee}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${pricing.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* Booking Form */}
          {pricing && (
            <form onSubmit={handleBooking} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.user.name}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      user: { ...bookingForm.user, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingForm.user.email}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      user: { ...bookingForm.user, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.user.phone}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      user: { ...bookingForm.user, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Confirm Booking - $${pricing.total}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
