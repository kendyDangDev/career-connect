const { PrismaClient } = require('../src/generated/prisma');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start = new Date(2020, 0, 1), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
  try {
    console.log('🌱 Bắt đầu seed database...');

    // 1. Seed Industries
    console.log('📊 Tạo Industries...');
    const industries = [
      {
        name: 'Công nghệ thông tin',
        slug: 'cong-nghe-thong-tin',
        description: 'Phát triển phần mềm, web, mobile',
      },
      {
        name: 'Tài chính - Ngân hàng',
        slug: 'tai-chinh-ngan-hang',
        description: 'Dịch vụ tài chính và ngân hàng',
      },
      { name: 'Y tế - Sức khỏe', slug: 'y-te-suc-khoe', description: 'Chăm sóc sức khỏe và y tế' },
      { name: 'Giáo dục - Đào tạo', slug: 'giao-duc-dao-tao', description: 'Giáo dục và đào tạo' },
      {
        name: 'Sản xuất - Chế tạo',
        slug: 'san-xuat-che-tao',
        description: 'Sản xuất và chế tạo công nghiệp',
      },
      {
        name: 'Thương mại - Bán lẻ',
        slug: 'thuong-mai-ban-le',
        description: 'Kinh doanh thương mại và bán lẻ',
      },
      {
        name: 'Du lịch - Khách sạn',
        slug: 'du-lich-khach-san',
        description: 'Dịch vụ du lịch và khách sạn',
      },
      {
        name: 'Marketing - Quảng cáo',
        slug: 'marketing-quang-cao',
        description: 'Marketing và quảng cáo',
      },
    ];

    const createdIndustries = [];
    for (const industry of industries) {
      const created = await prisma.industry.create({
        data: {
          ...industry,
          sortOrder: industries.indexOf(industry) + 1,
        },
      });
      createdIndustries.push(created);
    }

    // 2. Seed Categories
    console.log('📂 Tạo Categories...');
    const categories = [
      { name: 'Lập trình', slug: 'lap-trinh', description: 'Các vị trí lập trình viên' },
      { name: 'Thiết kế', slug: 'thiet-ke', description: 'Thiết kế đồ họa, UI/UX' },
      { name: 'Quản lý dự án', slug: 'quan-ly-du-an', description: 'Quản lý và điều phối dự án' },
      { name: 'Kinh doanh', slug: 'kinh-doanh', description: 'Bán hàng và phát triển kinh doanh' },
      { name: 'Nhân sự', slug: 'nhan-su', description: 'Quản lý nguồn nhân lực' },
      { name: 'Kế toán', slug: 'ke-toan', description: 'Kế toán và tài chính' },
      { name: 'Marketing', slug: 'marketing', description: 'Marketing và truyền thông' },
      { name: 'Vận hành', slug: 'van-hanh', description: 'Vận hành và logistics' },
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.create({
        data: {
          ...category,
          sortOrder: categories.indexOf(category) + 1,
        },
      });
      createdCategories.push(created);
    }

    // 3. Seed Skills
    console.log('🛠️ Tạo Skills...');
    const skills = [
      // Technical Skills
      {
        name: 'JavaScript',
        slug: 'javascript',
        category: 'TECHNICAL',
        description: 'Ngôn ngữ lập trình JavaScript',
      },
      {
        name: 'TypeScript',
        slug: 'typescript',
        category: 'TECHNICAL',
        description: 'Ngôn ngữ lập trình TypeScript',
      },
      {
        name: 'React',
        slug: 'react',
        category: 'TECHNICAL',
        description: 'Thư viện React cho frontend',
      },
      { name: 'Next.js', slug: 'nextjs', category: 'TECHNICAL', description: 'Framework Next.js' },
      {
        name: 'Node.js',
        slug: 'nodejs',
        category: 'TECHNICAL',
        description: 'Runtime Node.js cho backend',
      },
      {
        name: 'Python',
        slug: 'python',
        category: 'TECHNICAL',
        description: 'Ngôn ngữ lập trình Python',
      },
      { name: 'Java', slug: 'java', category: 'TECHNICAL', description: 'Ngôn ngữ lập trình Java' },
      { name: 'C#', slug: 'csharp', category: 'TECHNICAL', description: 'Ngôn ngữ lập trình C#' },
      { name: 'PHP', slug: 'php', category: 'TECHNICAL', description: 'Ngôn ngữ lập trình PHP' },
      { name: 'SQL', slug: 'sql', category: 'TECHNICAL', description: 'Cơ sở dữ liệu SQL' },
      {
        name: 'MongoDB',
        slug: 'mongodb',
        category: 'TECHNICAL',
        description: 'Cơ sở dữ liệu NoSQL MongoDB',
      },
      {
        name: 'PostgreSQL',
        slug: 'postgresql',
        category: 'TECHNICAL',
        description: 'Cơ sở dữ liệu PostgreSQL',
      },
      {
        name: 'Docker',
        slug: 'docker',
        category: 'TOOL',
        description: 'Containerization với Docker',
      },
      { name: 'AWS', slug: 'aws', category: 'TOOL', description: 'Amazon Web Services' },
      { name: 'Git', slug: 'git', category: 'TOOL', description: 'Version control với Git' },

      // Soft Skills
      {
        name: 'Giao tiếp',
        slug: 'giao-tiep',
        category: 'SOFT',
        description: 'Kỹ năng giao tiếp hiệu quả',
      },
      {
        name: 'Làm việc nhóm',
        slug: 'lam-viec-nhom',
        category: 'SOFT',
        description: 'Khả năng làm việc nhóm',
      },
      { name: 'Lãnh đạo', slug: 'lanh-dao', category: 'SOFT', description: 'Kỹ năng lãnh đạo' },
      {
        name: 'Giải quyết vấn đề',
        slug: 'giai-quyet-van-de',
        category: 'SOFT',
        description: 'Tư duy phân tích và giải quyết vấn đề',
      },
      {
        name: 'Quản lý thời gian',
        slug: 'quan-ly-thoi-gian',
        category: 'SOFT',
        description: 'Kỹ năng quản lý thời gian',
      },

      // Language Skills
      {
        name: 'Tiếng Anh',
        slug: 'tieng-anh',
        category: 'LANGUAGE',
        description: 'Ngôn ngữ tiếng Anh',
      },
      {
        name: 'Tiếng Nhật',
        slug: 'tieng-nhat',
        category: 'LANGUAGE',
        description: 'Ngôn ngữ tiếng Nhật',
      },
      {
        name: 'Tiếng Hàn',
        slug: 'tieng-han',
        category: 'LANGUAGE',
        description: 'Ngôn ngữ tiếng Hàn',
      },
      {
        name: 'Tiếng Trung',
        slug: 'tieng-trung',
        category: 'LANGUAGE',
        description: 'Ngôn ngữ tiếng Trung',
      },
    ];

    const createdSkills = [];
    for (const skill of skills) {
      const created = await prisma.skill.create({
        data: skill,
      });
      createdSkills.push(created);
    }

    // 4. Seed Users (Admin, Candidates, Employers)
    console.log('👥 Tạo Users...');
    const users = [];

    // Admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@careerconnect.com',
        passwordHash: await bcryptjs.hash('admin123', 12),
        firstName: 'Admin',
        lastName: 'System',
        userType: 'ADMIN',
        emailVerified: true,
        status: 'ACTIVE',
        profile: {
          create: {
            bio: 'System Administrator',
            country: 'Vietnam',
          },
        },
      },
    });
    users.push(adminUser);

    // Candidate users
    const candidateData = [
      {
        email: 'nguyenvana@gmail.com',
        firstName: 'Văn A',
        lastName: 'Nguyễn',
        phone: '0901234567',
      },
      { email: 'tranthib@gmail.com', firstName: 'Thị B', lastName: 'Trần', phone: '0901234568' },
      { email: 'levanc@gmail.com', firstName: 'Văn C', lastName: 'Lê', phone: '0901234569' },
      { email: 'phamthid@gmail.com', firstName: 'Thị D', lastName: 'Phạm', phone: '0901234570' },
      { email: 'hoangvane@gmail.com', firstName: 'Văn E', lastName: 'Hoàng', phone: '0901234571' },
    ];

    const candidates = [];
    for (const candidateInfo of candidateData) {
      const candidate = await prisma.user.create({
        data: {
          ...candidateInfo,
          passwordHash: await bcryptjs.hash('123456', 12),
          userType: 'CANDIDATE',
          emailVerified: true,
          status: 'ACTIVE',
          profile: {
            create: {
              dateOfBirth: getRandomDate(new Date(1990, 0, 1), new Date(2000, 11, 31)),
              gender: getRandomElement(['MALE', 'FEMALE']),
              city: getRandomElement(['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng']),
              province: getRandomElement([
                'Hà Nội',
                'Hồ Chí Minh',
                'Đà Nẵng',
                'Cần Thơ',
                'Hải Phòng',
              ]),
              country: 'Vietnam',
              bio: 'Chuyên viên IT với nhiều năm kinh nghiệm',
            },
          },
          candidate: {
            create: {
              currentPosition: getRandomElement([
                'Developer',
                'Designer',
                'Tester',
                'Business Analyst',
              ]),
              experienceYears: getRandomNumber(1, 8),
              expectedSalaryMin: getRandomNumber(800, 1500) * 10000,
              expectedSalaryMax: getRandomNumber(1500, 3000) * 10000,
              currency: 'VND',
              availabilityStatus: getRandomElement(['AVAILABLE', 'PASSIVE']),
              preferredWorkType: getRandomElement(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
              preferredLocationType: getRandomElement(['ONSITE', 'REMOTE', 'HYBRID']),
            },
          },
        },
      });
      candidates.push(candidate);
    }

    // Employer users
    const employerData = [
      { email: 'hr@techcorp.com', firstName: 'HR', lastName: 'Manager', phone: '0281234567' },
      {
        email: 'recruiter@innovate.com',
        firstName: 'Recruiter',
        lastName: 'Lead',
        phone: '0281234568',
      },
      {
        email: 'hr@fintech.com',
        firstName: 'Talent',
        lastName: 'Acquisition',
        phone: '0281234569',
      },
    ];

    const employers = [];
    for (const employerInfo of employerData) {
      const employer = await prisma.user.create({
        data: {
          ...employerInfo,
          passwordHash: await bcryptjs.hash('123456', 12),
          userType: 'EMPLOYER',
          emailVerified: true,
          status: 'ACTIVE',
          profile: {
            create: {
              city: getRandomElement(['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng']),
              province: getRandomElement(['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng']),
              country: 'Vietnam',
              bio: 'Chuyên viên tuyển dụng',
            },
          },
        },
      });
      employers.push(employer);
    }

    users.push(...candidates, ...employers);

    // 5. Seed Companies
    console.log('🏢 Tạo Companies...');
    const companyData = [
      {
        companyName: 'TechCorp Vietnam',
        companySlug: 'techcorp-vietnam',
        description: 'Công ty công nghệ hàng đầu Việt Nam',
        websiteUrl: 'https://techcorp.vn',
        address: '123 Trần Hưng Đạo, Quận 1',
        city: 'Hồ Chí Minh',
        province: 'Hồ Chí Minh',
        phone: '028-1234-5678',
        email: 'contact@techcorp.vn',
        foundedYear: 2015,
        companySize: 'LARGE_201_500',
        logoUrl:
          'https://cloztalk.com/cdn/shop/collections/Tech_Corps_-_color_logo_400x.png?v=1610723181',
      },
      {
        companyName: 'Innovate Solutions',
        companySlug: 'innovate-solutions',
        description: 'Giải pháp công nghệ sáng tạo',
        websiteUrl: 'https://innovate.com',
        address: '456 Nguyễn Trãi, Thanh Xuân',
        city: 'Hà Nội',
        province: 'Hà Nội',
        phone: '024-1234-5678',
        email: 'info@innovate.com',
        foundedYear: 2018,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRHQPL5w3i3StyeIenRIAEai93KoP5vPrq9Q&s',
      },
      {
        companyName: 'FinTech Pro',
        companySlug: 'fintech-pro',
        description: 'Công nghệ tài chính tiên tiến',
        websiteUrl: 'https://fintechpro.vn',
        address: '789 Lê Lợi, Hải Châu',
        city: 'Đà Nẵng',
        province: 'Đà Nẵng',
        phone: '0236-1234-567',
        email: 'contact@fintechpro.vn',
        foundedYear: 2020,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYe1NtZ0TJwo0P6Z26X2GxA3s124zX8TTa3Q&s',
      },

      {
        companyName: 'Tech Innovate',
        companySlug: 'tech-innovate',
        description: 'Đổi mới công nghệ hàng đầu',
        websiteUrl: 'https://techinnovate.vn',
        address: '123 Nguyễn Huệ, Quận 1',
        city: 'Hồ Chí Minh',
        province: 'Hồ Chí Minh',
        phone: '028-9876-543',
        email: 'info@techinnovate.vn',
        foundedYear: 2018,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://static.vecteezy.com/system/resources/thumbnails/036/152/209/small_2x/technology-innovation-concept-logo-design-template-free-vector.jpg',
      },
      {
        companyName: 'Green Solutions',
        companySlug: 'green-solutions',
        description: 'Giải pháp xanh bền vững',
        websiteUrl: 'https://greensolutions.vn',
        address: '456 Trần Phú, Thanh Khê',
        city: 'Đà Nẵng',
        province: 'Đà Nẵng',
        phone: '0236-4567-890',
        email: 'support@greensolutions.vn',
        foundedYear: 2019,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://mir-s3-cdn-cf.behance.net/project_modules/hd/304b4775024763.5c40e92d045d3.jpg',
      },
      {
        companyName: 'EduTech Hub',
        companySlug: 'edutech-hub',
        description: 'Trung tâm công nghệ giáo dục',
        websiteUrl: 'https://edutechhub.vn',
        address: '101 Hùng Vương, Hải Phòng',
        city: 'Hải Phòng',
        province: 'Hải Phòng',
        phone: '031-2345-678',
        email: 'contact@edutechhub.vn',
        foundedYear: 2021,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://i0.wp.com/edtechhub.org/wp-content/uploads/2020/09/favicon.png?fit=300%2C300&ssl=1',
      },
      {
        companyName: 'HealthCare Plus',
        companySlug: 'healthcare-plus',
        description: 'Dịch vụ y tế tiên tiến',
        websiteUrl: 'https://healthcareplus.vn',
        address: '321 Lý Thường Kiệt, Cầu Giấy',
        city: 'Hà Nội',
        province: 'Hà Nội',
        phone: '024-5678-901',
        email: 'info@healthcareplus.vn',
        foundedYear: 2017,
        companySize: 'ENTERPRISE_500_PLUS',
        logoUrl:
          'https://static.vecteezy.com/system/resources/previews/021/980/611/non_2x/medical-logo-healthcare-and-pharmacy-logo-design-and-icon-template-vector.jpg',
      },
      {
        companyName: 'LogiTech',
        companySlug: 'logitech',
        description: 'Giải pháp logistics thông minh',
        websiteUrl: 'https://logitech.vn',
        address: '654 Nguyễn Trãi, Thanh Xuân',
        city: 'Hà Nội',
        province: 'Hà Nội',
        phone: '024-3456-789',
        email: 'support@logitech.vn',
        foundedYear: 2022,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Logitech.svg/250px-Logitech.svg.png',
      },
      {
        companyName: 'RetailMaster',
        companySlug: 'retail-master',
        description: 'Nền tảng bán lẻ hiện đại',
        websiteUrl: 'https://retailmaster.vn',
        address: '987 Hai Bà Trưng, Ninh Kiều',
        city: 'Cần Thơ',
        province: 'Cần Thơ',
        phone: '0292-8765-432',
        email: 'contact@retailmaster.vn',
        foundedYear: 2016,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThZgmeV2ZwKYC8wROSuvDpIrWIBUGV8uqArQ&s',
      },
      {
        companyName: 'SmartBuild',
        companySlug: 'smart-build',
        description: 'Xây dựng thông minh và bền vững',
        websiteUrl: 'https://smartbuild.vn',
        address: '258 Lê Đại Hành, Liên Chiểu',
        city: 'Đà Nẵng',
        province: 'Đà Nẵng',
        phone: '0236-7890-123',
        email: 'info@smartbuild.vn',
        foundedYear: 2023,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzEsYoKLzHCaSClK_XqnS3-KiDysxC3zGFww&s',
      },
      {
        companyName: 'CyberSec',
        companySlug: 'cyber-sec',
        description: 'Bảo mật mạng chuyên sâu',
        websiteUrl: 'https://cybersec.vn',
        address: '147 Trần Hưng Đạo, Hải Châu',
        city: 'Đà Nẵng',
        province: 'Đà Nẵng',
        phone: '0236-6543-210',
        email: 'support@cybersec.vn',
        foundedYear: 2015,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://t4.ftcdn.net/jpg/05/96/89/71/360_F_596897127_EZfIxmLrtfqUW0IFXgIh3qzHN3hxs0TP.jpg',
      },
      {
        companyName: 'TravelEasy',
        companySlug: 'travel-easy',
        description: 'Giải pháp du lịch tiện lợi',
        websiteUrl: 'https://traveleasy.vn',
        address: '369 Hoàng Văn Thụ, Tân Bình',
        city: 'Hồ Chí Minh',
        province: 'Hồ Chí Minh',
        phone: '028-4321-876',
        email: 'contact@traveleasy.vn',
        foundedYear: 2020,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLgmzPGLPRZtbU5LKSpCvBQkdEcMhBs_O7Kw&s',
      },
      {
        companyName: 'AgriTech',
        companySlug: 'agri-tech',
        description: 'Công nghệ nông nghiệp hiện đại',
        websiteUrl: 'https://agritech.vn',
        address: '852 Nguyễn Văn Cừ, Ninh Kiều',
        city: 'Cần Thơ',
        province: 'Cần Thơ',
        phone: '0292-3456-789',
        email: 'info@agritech.vn',
        foundedYear: 2019,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://khoinghiepnongnghiep.vn/lovable-uploads/c6a3b8b8-6077-46fc-bc94-7b4ef797f08b.png',
      },
    ];

    const companies = [];
    for (let i = 0; i < companyData.length; i++) {
      const company = await prisma.company.create({
        data: {
          ...companyData[i],
          industryId: createdIndustries[i % createdIndustries.length].id,
          verificationStatus: 'VERIFIED',
        },
      });
      companies.push(company);

      // Create company users
      await prisma.companyUser.create({
        data: {
          companyId: company.id,
          userId: employers[i % employers.length].id,
          role: 'ADMIN',
          isPrimaryContact: true,
        },
      });
    }

    // 6. Add candidate skills
    console.log('🎯 Tạo Candidate Skills...');
    for (const candidate of candidates) {
      const candidateRecord = await prisma.candidate.findUnique({
        where: { userId: candidate.id },
      });

      // Add random skills to each candidate
      const randomSkills = createdSkills
        .sort(() => 0.5 - Math.random())
        .slice(0, getRandomNumber(3, 8));

      for (const skill of randomSkills) {
        await prisma.candidateSkill.create({
          data: {
            candidateId: candidateRecord.id,
            skillId: skill.id,
            proficiencyLevel: getRandomElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
            yearsExperience: getRandomNumber(1, 5),
          },
        });
      }

      // Add education
      await prisma.candidateEducation.create({
        data: {
          candidateId: candidateRecord.id,
          institutionName: getRandomElement([
            'ĐH Bách Khoa',
            'ĐH Kinh Tế',
            'ĐH Công Nghệ',
            'ĐH Sư Phạm',
          ]),
          degreeType: getRandomElement(['BACHELOR', 'MASTER']),
          fieldOfStudy: getRandomElement([
            'Công nghệ thông tin',
            'Kỹ thuật phần mềm',
            'Khoa học máy tính',
            'Kinh tế',
          ]),
          startDate: getRandomDate(new Date(2015, 0, 1), new Date(2018, 11, 31)),
          endDate: getRandomDate(new Date(2019, 0, 1), new Date(2022, 11, 31)),
          gpa: parseFloat((Math.random() * (4.0 - 2.5) + 2.5).toFixed(2)),
          description: 'Tốt nghiệp loại khá',
        },
      });

      // Add experience
      const startDate = getRandomDate(new Date(2020, 0, 1), new Date(2022, 11, 31));
      await prisma.candidateExperience.create({
        data: {
          candidateId: candidateRecord.id,
          companyName: getRandomElement(['ABC Tech', 'XYZ Software', 'DEF Solutions']),
          positionTitle: getRandomElement([
            'Junior Developer',
            'Software Engineer',
            'Web Developer',
          ]),
          employmentType: getRandomElement(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
          startDate: startDate,
          endDate: getRandomDate(startDate, new Date()),
          isCurrent: Math.random() < 0.3,
          description: 'Phát triển và bảo trì ứng dụng web',
          achievements: 'Hoàn thành xuất sắc các dự án được giao',
        },
      });
    }

    // 7. Seed Jobs
    console.log('💼 Tạo Jobs...');
    const jobTitles = [
      'Frontend Developer (React/Next.js)',
      'Backend Developer (Node.js)',
      'Full-stack Developer',
      'UI/UX Designer',
      'Project Manager',
      'Business Analyst',
      'DevOps Engineer',
      'QA Tester',
      'Product Manager',
      'Data Analyst',
    ];

    const jobs = [];
    for (let i = 0; i < 20; i++) {
      const company = companies[i % companies.length];
      const employer = employers[i % employers.length];
      const title = jobTitles[i % jobTitles.length];

      const job = await prisma.job.create({
        data: {
          companyId: company.id,
          recruiterId: employer.id,
          title: title,
          slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
          description: `Mô tả công việc cho vị trí ${title}. Chúng tôi đang tìm kiếm một chuyên viên có kinh nghiệm để tham gia vào đội ngũ phát triển sản phẩm.`,
          requirements: `
- Tối thiểu 2 năm kinh nghiệm trong lĩnh vực liên quan
- Có kiến thức vững về các công nghệ hiện đại
- Khả năng làm việc nhóm tốt
- Thái độ học hỏi và phát triển bản thân
          `,
          benefits: `
- Lương thưởng hấp dẫn
- Bảo hiểm đầy đủ
- Môi trường làm việc năng động
- Cơ hội thăng tiến rõ ràng
          `,
          jobType: getRandomElement(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
          workLocationType: getRandomElement(['ONSITE', 'REMOTE', 'HYBRID']),
          experienceLevel: getRandomElement(['ENTRY', 'MID', 'SENIOR']),
          salaryMin: getRandomNumber(1000, 2000) * 10000,
          salaryMax: getRandomNumber(2000, 4000) * 10000,
          currency: 'VND',
          salaryNegotiable: Math.random() < 0.3,
          locationCity: company.city,
          locationProvince: company.province,
          locationCountry: 'Vietnam',
          applicationDeadline: getRandomDate(new Date(), new Date(2025, 11, 31)),
          status: 'ACTIVE',
          viewCount: getRandomNumber(50, 500),
          applicationCount: getRandomNumber(5, 50),
          featured: Math.random() < 0.2,
          urgent: Math.random() < 0.1,
          publishedAt: getRandomDate(new Date(2024, 0, 1), new Date()),
        },
      });
      jobs.push(job);

      // Add job categories
      const randomCategories = createdCategories
        .sort(() => 0.5 - Math.random())
        .slice(0, getRandomNumber(1, 3));

      for (const category of randomCategories) {
        await prisma.jobCategory.create({
          data: {
            jobId: job.id,
            categoryId: category.id,
          },
        });
      }

      // Add job skills
      const randomSkills = createdSkills
        .sort(() => 0.5 - Math.random())
        .slice(0, getRandomNumber(3, 6));

      for (const skill of randomSkills) {
        await prisma.jobSkill.create({
          data: {
            jobId: job.id,
            skillId: skill.id,
            requiredLevel: getRandomElement(['NICE_TO_HAVE', 'PREFERRED', 'REQUIRED']),
            minYearsExperience: getRandomNumber(1, 5),
          },
        });
      }
    }

    // 8. Seed Applications
    console.log('📋 Tạo Applications...');
    for (let i = 0; i < 30; i++) {
      const candidate = candidates[i % candidates.length];
      const job = jobs[i % jobs.length];

      const candidateRecord = await prisma.candidate.findUnique({
        where: { userId: candidate.id },
      });

      const application = await prisma.application.create({
        data: {
          jobId: job.id,
          candidateId: candidateRecord.id,
          userId: candidate.id,
          coverLetter:
            'Tôi rất quan tâm đến vị trí này và tin rằng kỹ năng của tôi phù hợp với yêu cầu công việc.',
          status: getRandomElement([
            'APPLIED',
            'SCREENING',
            'INTERVIEWING',
            'OFFERED',
            'HIRED',
            'REJECTED',
          ]),
          appliedAt: getRandomDate(new Date(2024, 0, 1), new Date()),
          rating: getRandomNumber(1, 5),
        },
      });

      // Add application timeline
      await prisma.applicationTimeline.create({
        data: {
          applicationId: application.id,
          status: 'APPLIED',
          note: 'Ứng viên đã nộp hồ sơ',
          changedBy: job.recruiterId,
        },
      });
    }

    // 9. Seed other data
    console.log('🔔 Tạo Notifications...');
    for (const user of candidates.slice(0, 3)) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'APPLICATION_STATUS',
          title: 'Trạng thái ứng tuyển đã được cập nhật',
          message: 'Hồ sơ của bạn đang được xem xét bởi nhà tuyển dụng.',
          data: { applicationId: 'app_123' },
        },
      });
    }

    console.log('📊 Tạo Job Views...');
    for (let i = 0; i < 50; i++) {
      const job = jobs[i % jobs.length];
      const user = users[i % users.length];

      await prisma.jobView.create({
        data: {
          jobId: job.id,
          userId: user.id,
          ipAddress: `192.168.1.${getRandomNumber(1, 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          viewedAt: getRandomDate(new Date(2024, 0, 1), new Date()),
        },
      });
    }

    console.log('⭐ Tạo Company Reviews...');
    for (let i = 0; i < 10; i++) {
      const company = companies[i % companies.length];
      const user = candidates[i % candidates.length];

      await prisma.companyReview.create({
        data: {
          companyId: company.id,
          reviewerId: user.id,
          rating: getRandomNumber(3, 5),
          title: 'Công ty tốt để làm việc',
          reviewText: 'Môi trường làm việc chuyên nghiệp, đồng nghiệp thân thiện.',
          pros: 'Lương tốt, phúc lợi đầy đủ',
          cons: 'Áp lực công việc cao',
          workLifeBalanceRating: getRandomNumber(3, 5),
          salaryBenefitRating: getRandomNumber(3, 5),
          managementRating: getRandomNumber(3, 5),
          cultureRating: getRandomNumber(3, 5),
          employmentStatus: 'CURRENT',
          positionTitle: 'Software Developer',
          employmentLength: '1-2 năm',
          isApproved: true,
        },
      });
    }

    // 10. Create system settings
    console.log('⚙️ Tạo System Settings...');
    const systemSettings = [
      { key: 'site_name', value: 'Career Connect', description: 'Tên website', dataType: 'STRING' },
      {
        key: 'max_file_size',
        value: '10485760',
        description: 'Kích thước file tối đa (bytes)',
        dataType: 'NUMBER',
      },
      {
        key: 'email_notifications',
        value: 'true',
        description: 'Bật thông báo email',
        dataType: 'BOOLEAN',
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Chế độ bảo trì',
        dataType: 'BOOLEAN',
      },
    ];

    for (const setting of systemSettings) {
      await prisma.systemSetting.create({
        data: {
          ...setting,
          updatedBy: adminUser.id,
        },
      });
    }

    console.log('✅ Seed database hoàn thành!');
    console.log(`
📊 Thống kê:
- Industries: ${createdIndustries.length}
- Categories: ${createdCategories.length}
- Skills: ${createdSkills.length}
- Users: ${users.length} (1 admin, ${candidates.length} candidates, ${employers.length} employers)
- Companies: ${companies.length}
- Jobs: ${jobs.length}
- Applications: 30
- Notifications: 3
- Job Views: 50
- Company Reviews: 10
- System Settings: ${systemSettings.length}

🔑 Test Accounts:
Admin: admin@careerconnect.com / admin123
Candidate: nguyenvana@gmail.com / 123456
Employer: hr@techcorp.com / 123456
    `);
  } catch (error) {
    console.error('❌ Lỗi khi seed database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
