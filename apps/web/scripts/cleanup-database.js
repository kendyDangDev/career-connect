const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🧹 Bắt đầu cleanup database...');

  try {
    // Xóa dữ liệu theo thứ tự ngược lại với foreign key constraints
    console.log('Xóa Application Timeline...');
    await prisma.applicationTimeline.deleteMany();

    console.log('Xóa Applications...');
    await prisma.application.deleteMany();

    console.log('Xóa Job Views...');
    await prisma.jobView.deleteMany();

    console.log('Xóa Saved Jobs...');
    await prisma.savedJob.deleteMany();

    console.log('Xóa Job Skills...');
    await prisma.jobSkill.deleteMany();

    console.log('Xóa Job Categories...');
    await prisma.jobCategory.deleteMany();

    console.log('Xóa Jobs...');
    await prisma.job.deleteMany();

    console.log('Xóa Company Reviews...');
    await prisma.companyReview.deleteMany();

    console.log('Xóa Interview Reviews...');
    await prisma.interviewReview.deleteMany();

    console.log('Xóa Company Followers...');
    await prisma.companyFollower.deleteMany();

    console.log('Xóa Company Users...');
    await prisma.companyUser.deleteMany();

    console.log('Xóa Companies...');
    await prisma.company.deleteMany();

    console.log('Xóa Job Alerts...');
    await prisma.jobAlert.deleteMany();

    console.log('Xóa Candidate CVs...');
    await prisma.candidateCv.deleteMany();

    console.log('Xóa Candidate Certifications...');
    await prisma.candidateCertification.deleteMany();

    console.log('Xóa Candidate Experience...');
    await prisma.candidateExperience.deleteMany();

    console.log('Xóa Candidate Education...');
    await prisma.candidateEducation.deleteMany();

    console.log('Xóa Candidate Skills...');
    await prisma.candidateSkill.deleteMany();

    console.log('Xóa Candidates...');
    await prisma.candidate.deleteMany();

    console.log('Xóa Notifications...');
    await prisma.notification.deleteMany();

    console.log('Xóa Message Reads...');
    await prisma.messageRead.deleteMany();

    console.log('Xóa Message Attachments...');
    await prisma.messageAttachment.deleteMany();

    console.log('Xóa Messages...');
    await prisma.message.deleteMany();

    console.log('Xóa Conversation Participants...');
    await prisma.conversationParticipant.deleteMany();

    console.log('Xóa Conversations...');
    await prisma.conversation.deleteMany();

    console.log('Xóa System Settings...');
    await prisma.systemSetting.deleteMany();

    console.log('Xóa Audit Logs...');
    await prisma.auditLog.deleteMany();

    console.log('Xóa Verification Tokens...');
    await prisma.emailVerificationToken.deleteMany();
    await prisma.phoneVerificationToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();

    console.log('Xóa User Profiles...');
    await prisma.userProfile.deleteMany();

    console.log('Xóa Sessions...');
    await prisma.session.deleteMany();

    console.log('Xóa Accounts...');
    await prisma.account.deleteMany();

    console.log('Xóa Users...');
    await prisma.user.deleteMany();

    console.log('Xóa Skills...');
    await prisma.skill.deleteMany();

    console.log('Xóa Categories...');
    await prisma.category.deleteMany();

    console.log('Xóa Industries...');
    await prisma.industry.deleteMany();

    console.log('Xóa Locations...');
    await prisma.location.deleteMany();

    console.log('Xóa Verification Tokens...');
    await prisma.verificationToken.deleteMany();

    console.log('✅ Cleanup database hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi khi cleanup database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup function
if (require.main === module) {
  cleanupDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { cleanupDatabase };
