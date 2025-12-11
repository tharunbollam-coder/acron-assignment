require('dotenv').config();
const mongoose = require('mongoose');
const Court = require('./models/Court');
const Coach = require('./models/Coach');
const Equipment = require('./models/Equipment');
const PricingRule = require('./models/PricingRule');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Court.deleteMany({});
    await Coach.deleteMany({});
    await Equipment.deleteMany({});
    await PricingRule.deleteMany({});

    // Create courts
    const courts = await Court.insertMany([
      {
        name: 'Court A - Premium Indoor',
        type: 'indoor',
        sport: 'badminton',
        basePrice: 25,
        description: 'Premium indoor badminton court with professional lighting',
        amenities: ['LED Lighting', 'Air Conditioning', 'Scoreboard', 'Seating Area']
      },
      {
        name: 'Court B - Standard Indoor',
        type: 'indoor',
        sport: 'badminton',
        basePrice: 20,
        description: 'Standard indoor badminton court',
        amenities: ['Lighting', 'Basic Seating']
      },
      {
        name: 'Court C - Outdoor',
        type: 'outdoor',
        sport: 'badminton',
        basePrice: 15,
        description: 'Outdoor badminton court with natural lighting',
        amenities: ['Natural Lighting', 'Wind Protection']
      },
      {
        name: 'Court D - Tennis Court 1',
        type: 'outdoor',
        sport: 'tennis',
        basePrice: 35,
        description: 'Professional tennis court with hard surface',
        amenities: ['Hard Surface', 'Net', 'Fencing', 'Night Lighting']
      }
    ]);

    // Create coaches
    const coaches = await Coach.insertMany([
      {
        name: 'John Smith',
        email: 'john.smith@facility.com',
        phone: '+1-555-0101',
        specializations: ['badminton'],
        hourlyRate: 30,
        bio: 'Certified badminton coach with 10 years of experience',
        certifications: ['Badminton Coaching Level 2', 'First Aid Certified']
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@facility.com',
        phone: '+1-555-0102',
        specializations: ['badminton', 'tennis'],
        hourlyRate: 35,
        bio: 'Multi-sport coach specializing in racket sports',
        certifications: ['Badminton Coaching Level 3', 'Tennis Coaching Level 2']
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@facility.com',
        phone: '+1-555-0103',
        specializations: ['tennis'],
        hourlyRate: 40,
        bio: 'Former professional tennis player turned coach',
        certifications: ['Tennis Coaching Level 3', 'Sports Psychology']
      }
    ]);

    // Create equipment
    const equipment = await Equipment.insertMany([
      {
        name: 'Professional Badminton Racket',
        type: 'racket',
        sport: 'badminton',
        totalStock: 20,
        availableStock: 20,
        rentalPrice: 5,
        condition: 'excellent'
      },
      {
        name: 'Badminton Shoes',
        type: 'shoes',
        sport: 'badminton',
        totalStock: 15,
        availableStock: 15,
        rentalPrice: 3,
        condition: 'good'
      },
      {
        name: 'Tennis Racket',
        type: 'racket',
        sport: 'tennis',
        totalStock: 10,
        availableStock: 10,
        rentalPrice: 8,
        condition: 'excellent'
      },
      {
        name: 'Tennis Balls (3 pack)',
        type: 'ball',
        sport: 'tennis',
        totalStock: 30,
        availableStock: 30,
        rentalPrice: 2,
        condition: 'good'
      },
      {
        name: 'Shuttlecocks (Tube of 6)',
        type: 'ball',
        sport: 'badminton',
        totalStock: 50,
        availableStock: 50,
        rentalPrice: 4,
        condition: 'good'
      }
    ]);

    // Create pricing rules
    const pricingRules = await PricingRule.insertMany([
      {
        name: 'Peak Hour Surcharge',
        type: 'peak_hour',
        startTime: '18:00',
        endTime: '21:00',
        multiplier: 1.5,
        priority: 1,
        isActive: true
      },
      {
        name: 'Weekend Surcharge',
        type: 'weekend',
        daysOfWeek: [0, 6], // Sunday and Saturday
        multiplier: 1.25,
        priority: 2,
        isActive: true
      },
      {
        name: 'Indoor Court Premium',
        type: 'court_type',
        applicableCourtTypes: ['indoor'],
        surcharge: 5,
        priority: 3,
        isActive: true
      }
    ]);

    console.log('Database seeded successfully!');
    console.log(`Created ${courts.length} courts`);
    console.log(`Created ${coaches.length} coaches`);
    console.log(`Created ${equipment.length} equipment items`);
    console.log(`Created ${pricingRules.length} pricing rules`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
}

module.exports = seedDatabase;
