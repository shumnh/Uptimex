const Website = require('../models/Website');
const User = require('../models/User');
const Assignment = require('../models/Assignment');

// Shuffle array for randomization
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Main assignment function
async function createAssignments() {
  try {
    console.log('🎯 Starting assignment process...');
    
    // Clear expired assignments
    await Assignment.deleteMany({ 
      expiresAt: { $lt: new Date() },
      completed: false 
    });
    
    // Get all websites that need monitoring
    const websites = await Website.find({});
    console.log(`📊 Found ${websites.length} websites to monitor`);
    
    // Get all active validators (including website owners who can also validate)
    const validators = await User.find({ 
      $or: [
        { role: 'validator' },
        { role: 'user', solanaWallet: { $exists: true, $ne: null } }
      ],
      solanaWallet: { $exists: true, $ne: null }
    });
    console.log(`👥 Found ${validators.length} active validators`);
    
    if (validators.length === 0) {
      console.log('⚠️ No validators available for assignments');
      return { success: false, message: 'No validators available' };
    }
    
    if (websites.length === 0) {
      console.log('⚠️ No websites to assign');
      return { success: false, message: 'No websites to assign' };
    }
    
    // Calculate assignments per validator (aim for 5, but adjust based on available websites)
    const websitesPerValidator = Math.min(5, Math.ceil(websites.length / validators.length));
    console.log(`🔢 Assigning ${websitesPerValidator} websites per validator`);
    
    // Randomize websites to ensure fair distribution
    const shuffledWebsites = shuffle(websites);
    
    const assignments = [];
    let websiteIndex = 0;
    
    // Assign websites to validators
    for (const validator of validators) {
      const validatorAssignments = [];
      
      for (let i = 0; i < websitesPerValidator && websiteIndex < shuffledWebsites.length; i++) {
        const website = shuffledWebsites[websiteIndex];
        
        // Check if this validator recently checked this website (avoid immediate repetition)
        const recentCheck = await Assignment.findOne({
          website: website._id,
          validator: validator._id,
          assignedAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
        });
        
        if (!recentCheck) {
          validatorAssignments.push({
            website: website._id,
            validator: validator._id
          });
        }
        
        websiteIndex++;
      }
      
      assignments.push(...validatorAssignments);
      console.log(`✅ Assigned ${validatorAssignments.length} websites to validator ${validator.username}`);
    }
    
    // Save all assignments to database
    if (assignments.length > 0) {
      await Assignment.insertMany(assignments);
      console.log(`🎉 Successfully created ${assignments.length} assignments`);
    }
    
    return { 
      success: true, 
      assignmentsCreated: assignments.length,
      validatorsInvolved: validators.length
    };
    
  } catch (error) {
    console.error('❌ Error creating assignments:', error);
    return { success: false, error: error.message };
  }
}

// Mark assignment as completed
async function markAssignmentCompleted(websiteId, validatorId) {
  try {
    await Assignment.updateOne(
      { 
        website: websiteId, 
        validator: validatorId, 
        completed: false 
      },
      { completed: true }
    );
    console.log(`✅ Marked assignment as completed for website ${websiteId} by validator ${validatorId}`);
  } catch (error) {
    console.error('❌ Error marking assignment completed:', error);
  }
}

module.exports = {
  createAssignments,
  markAssignmentCompleted
}; 