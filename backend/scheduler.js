const cron = require('node-cron');
const { createAssignments } = require('./utils/assignmentLogic');

// Run assignment process every 5 minutes
// Cron pattern: '*/5 * * * *' means every 5 minutes
function startScheduler() {
  console.log('🚀 Starting automatic assignment scheduler...');
  
  // Run immediately on startup
  createAssignments();
  
  // Schedule to run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('\n⏰ Running scheduled assignment process...');
    const result = await createAssignments();
    
    if (result.success) {
      console.log(`✅ Scheduler: Created ${result.assignmentsCreated} assignments for ${result.validatorsInvolved} validators`);
    } else {
      console.log(`❌ Scheduler failed: ${result.message || result.error}`);
    }
  });
  
  console.log('📅 Scheduler configured to run every 5 minutes');
}

// For manual testing/debugging
async function runAssignmentOnce() {
  console.log('🧪 Running assignment process manually...');
  const result = await createAssignments();
  console.log('Result:', result);
  return result;
}

module.exports = {
  startScheduler,
  runAssignmentOnce
}; 