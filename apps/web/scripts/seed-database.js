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

function getRandomDate(start = new Date(2023, 0, 1), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
  try {
    console.log('🌱 Bắt đầu seed database...');

    // 1. Industries
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
      createdIndustries.push(
        await prisma.industry.create({
          data: { ...industry, sortOrder: industries.indexOf(industry) + 1 },
        })
      );
    }

    // 2. Categories
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
      createdCategories.push(
        await prisma.category.create({
          data: { ...category, sortOrder: categories.indexOf(category) + 1 },
        })
      );
    }

    // 3. Skills
    console.log('🛠️ Tạo Skills...');
    const skills = [
      { name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' },
      { name: 'TypeScript', slug: 'typescript', category: 'TECHNICAL' },
      { name: 'React', slug: 'react', category: 'TECHNICAL' },
      { name: 'Next.js', slug: 'nextjs', category: 'TECHNICAL' },
      { name: 'Node.js', slug: 'nodejs', category: 'TECHNICAL' },
      { name: 'Python', slug: 'python', category: 'TECHNICAL' },
      { name: 'Java', slug: 'java', category: 'TECHNICAL' },
      { name: 'C#', slug: 'csharp', category: 'TECHNICAL' },
      { name: 'PHP', slug: 'php', category: 'TECHNICAL' },
      { name: 'SQL', slug: 'sql', category: 'TECHNICAL' },
      { name: 'MongoDB', slug: 'mongodb', category: 'TECHNICAL' },
      { name: 'PostgreSQL', slug: 'postgresql', category: 'TECHNICAL' },
      { name: 'Docker', slug: 'docker', category: 'TOOL' },
      { name: 'AWS', slug: 'aws', category: 'TOOL' },
      { name: 'Git', slug: 'git', category: 'TOOL' },
      { name: 'Giao tiếp', slug: 'giao-tiep', category: 'SOFT' },
      { name: 'Làm việc nhóm', slug: 'lam-viec-nhom', category: 'SOFT' },
      { name: 'Lãnh đạo', slug: 'lanh-dao', category: 'SOFT' },
      { name: 'Giải quyết vấn đề', slug: 'giai-quyet-van-de', category: 'SOFT' },
      { name: 'Quản lý thời gian', slug: 'quan-ly-thoi-gian', category: 'SOFT' },
      // Language Skills
      {
        name: 'Tiếng Anh',
        slug: 'tieng-anh',
        category: 'LANGUAGE',
      },
      {
        name: 'Tiếng Nhật',
        slug: 'tieng-nhat',
        category: 'LANGUAGE',
      },
      {
        name: 'Tiếng Hàn',
        slug: 'tieng-han',
        category: 'LANGUAGE',
      },
      {
        name: 'Tiếng Trung',
        slug: 'tieng-trung',
        category: 'LANGUAGE',
      },
    ];

    const createdSkills = [];
    for (const skill of skills) {
      createdSkills.push(await prisma.skill.create({ data: skill }));
    }

    // Groups logic setup
    const skillGroups = {
      frontend: ['javascript', 'typescript', 'react', 'nextjs'],
      backend: ['nodejs', 'python', 'java', 'csharp', 'php', 'sql', 'mongodb', 'postgresql'],
      design: ['giao-tiep', 'lam-viec-nhom', 'lanh-dao', 'giai-quyet-van-de', 'quan-ly-thoi-gian'],
    };
    const mapSkillIds = (slugArray) =>
      createdSkills.filter((s) => slugArray.includes(s.slug)).map((s) => s.id);

    // 4. Users (Admin, Employers, Candidate context overlaps)
    console.log('👥 Tạo Users...');

    await prisma.user.create({
      data: {
        email: 'admin@careerconnect.com',
        passwordHash: await bcryptjs.hash('admin123', 12),
        firstName: 'Admin',
        lastName: 'System',
        userType: 'ADMIN',
        emailVerified: true,
        status: 'ACTIVE',
        profile: { create: { bio: 'System Administrator', country: 'Vietnam' } },
      },
    });

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
          profile: { create: { city: 'Hồ Chí Minh', province: 'Hồ Chí Minh', country: 'Vietnam' } },
        },
      });
      employers.push(employer);
    }

    // Candidate structure combining groups + bulk data
    const candidateContexts = [
      // Frontend users
      {
        email: 'fe1@gmail.com',
        firstName: 'FE',
        lastName: 'Một',
        phone: '0901234501',
        group: 'frontend',
      },
      {
        email: 'fe2@gmail.com',
        firstName: 'FE',
        lastName: 'Hai',
        phone: '0901234502',
        group: 'frontend',
      },
      {
        email: 'fe3@gmail.com',
        firstName: 'FE',
        lastName: 'Ba',
        phone: '0901234503',
        group: 'frontend',
      },
      {
        email: 'nguyenvana@gmail.com',
        firstName: 'Văn A',
        lastName: 'Nguyễn',
        phone: '0901234567',
        group: 'frontend',
      },
      {
        email: 'phamthid@gmail.com',
        firstName: 'Thị D',
        lastName: 'Phạm',
        phone: '0901234570',
        group: 'frontend',
      },

      // Backend users
      {
        email: 'be1@gmail.com',
        firstName: 'BE',
        lastName: 'Một',
        phone: '0901234511',
        group: 'backend',
      },
      {
        email: 'be2@gmail.com',
        firstName: 'BE',
        lastName: 'Hai',
        phone: '0901234512',
        group: 'backend',
      },
      {
        email: 'be3@gmail.com',
        firstName: 'BE',
        lastName: 'Ba',
        phone: '0901234513',
        group: 'backend',
      },
      {
        email: 'tranthib@gmail.com',
        firstName: 'Thị B',
        lastName: 'Trần',
        phone: '0901234568',
        group: 'backend',
      },
      {
        email: 'hoangvane@gmail.com',
        firstName: 'Văn E',
        lastName: 'Hoàng',
        phone: '0901234571',
        group: 'backend',
      },

      // Design users
      {
        email: 'ui1@gmail.com',
        firstName: 'UI',
        lastName: 'Một',
        phone: '0901234521',
        group: 'design',
      },
      {
        email: 'ui2@gmail.com',
        firstName: 'UI',
        lastName: 'Hai',
        phone: '0901234522',
        group: 'design',
      },
      {
        email: 'levanc@gmail.com',
        firstName: 'Văn C',
        lastName: 'Lê',
        phone: '0901234569',
        group: 'design',
      },
    ];

    const candidates = [];
    for (const info of candidateContexts) {
      const candidate = await prisma.user.create({
        data: {
          email: info.email,
          firstName: info.firstName,
          lastName: info.lastName,
          phone: info.phone,
          passwordHash: await bcryptjs.hash('123456', 12),
          userType: 'CANDIDATE',
          emailVerified: true,
          status: 'ACTIVE',
          profile: { create: { country: 'Vietnam', city: 'Hà Nội' } },
          candidate: {
            create: {
              currentPosition:
                info.group === 'frontend'
                  ? 'Frontend Dev'
                  : info.group === 'backend'
                    ? 'Backend Dev'
                    : 'UI Designer',
              experienceYears: getRandomNumber(2, 8),
              expectedSalaryMin: getRandomNumber(800, 1500) * 10000,
              expectedSalaryMax: getRandomNumber(1500, 3000) * 10000,
              preferredWorkType: 'FULL_TIME',
              preferredLocationType: 'ONSITE',
            },
          },
        },
        include: { candidate: true },
      });

      const groupSkillIds = mapSkillIds(skillGroups[info.group]);
      if (groupSkillIds.length > 0) {
        await prisma.candidateSkill.createMany({
          data: groupSkillIds.map((skillId) => ({
            candidateId: candidate.candidate.id,
            skillId: skillId,
            proficiencyLevel: 'INTERMEDIATE',
          })),
        });
      }
      candidates.push({ ...candidate, group: info.group });
    }

    // 5. Companies
    console.log('🏢 Tạo Companies...');
    const companyData = [
      {
        companyName: 'TechCorp Vietnam',
        companySlug: 'techcorp-vietnam',
        description:
          'TechCorp Vietnam là công ty nền tảng công nghệ hàng đầu, chuyên cung cấp giải pháp phần mềm và điện toán đám mây. Với môi trường làm việc năng động và chú trọng đổi mới, chúng tôi luôn tạo ra cơ hội phát triển vượt bậc cho nhân tài IT.',
        websiteUrl: 'https://techcorp.vn',
        address: '123 Trần Hưng Đạo, Quận 1',
        city: 'Hồ Chí Minh',
        province: 'Hồ Chí Minh',
        phone: '028-1234-5678',
        email: 'contact@techcorp.vn',
        foundedYear: 2015,
        companySize: 'LARGE_201_500',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192754/Tech_Corps_-_color_logo_400x_prrzhc.webp',
      },
      {
        companyName: 'Innovate Solutions',
        companySlug: 'innovate-solutions',
        description:
          'Innovate Solutions tập trung phát triển các giải pháp công nghệ sáng tạo, hỗ trợ quá trình chuyển đổi số toàn diện cho doanh nghiệp. Chúng tôi đề cao tinh thần làm việc nhóm và cam kết mang lại những giá trị cốt lõi bền vững cho khách hàng.',
        websiteUrl: 'https://innovate.com',
        address: '456 Nguyễn Trãi, Thanh Xuân',
        city: 'Hà Nội',
        province: 'Hà Nội',
        phone: '024-1234-5678',
        email: 'info@innovate.com',
        foundedYear: 2018,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192813/techinno_wsjdqw.jpg',
      },
      {
        companyName: 'FinTech Pro',
        companySlug: 'fintech-pro',
        description:
          'FinTech Pro là đơn vị tiên phong trong lĩnh vực công nghệ tài chính, không ngừng mang đến những giải pháp thanh toán và quản lý dòng tiền đột phá. Chúng tôi quy tụ đội ngũ chuyên gia hàng đầu để kiến tạo hệ sinh thái tài chính số an toàn.',
        websiteUrl: 'https://fintechpro.vn',
        address: '789 Lê Lợi, Hải Châu',
        city: 'Đà Nẵng',
        province: 'Đà Nẵng',
        phone: '0236-1234-567',
        email: 'contact@fintechpro.vn',
        foundedYear: 2025,
        companySize: 'SMALL_11_50',
        logoUrl: 'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192723/fintech_jmsgt0.jpg',
      },

      {
        companyName: 'Tech Innovate',
        companySlug: 'tech-innovate',
        description:
          'Đổi mới công nghệ luôn là kim chỉ nam tại Tech Innovate. Chúng tôi cung cấp các nền tảng trí tuệ nhân tạo và tự động hóa giúp tối ưu hóa nghiệp vụ cho các đối tác lớn. Gia nhập Tech Innovate là bước đệm hoàn hảo để thành công.',
        websiteUrl: 'https://techinnovate.vn',
        address: '123 Nguyễn Huệ, Quận 1',
        city: 'Hồ Chí Minh',
        province: 'Hồ Chí Minh',
        phone: '028-9876-543',
        email: 'info@techinnovate.vn',
        foundedYear: 2018,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192813/techinno_wsjdqw.jpg',
      },
      {
        companyName: 'Green Solutions',
        companySlug: 'green-solutions',
        description:
          'Tiên phong trong mảng công nghệ xanh, Green Solutions nghiên cứu và cung cấp các giải pháp vận hành bền vững nhằm bảo vệ môi trường. Cùng hướng đến giảm thiểu rác thải, tối ưu hóa năng lượng tái tạo và chung tay xây dựng một hệ sinh thái sống văn minh.',
        websiteUrl: 'https://greensolutions.vn',
        address: '456 Trần Phú, Thanh Khê',
        city: 'Đà Nẵng',
        province: 'Đà Nẵng',
        phone: '0236-4567-890',
        email: 'support@greensolutions.vn',
        foundedYear: 2019,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/greensolution_g1icts.jpg',
      },
      {
        companyName: 'EduTech Hub',
        companySlug: 'edutech-hub',
        description:
          'EduTech Hub là trung tâm công nghệ giáo dục hàng đầu, chuyên phát triển các nền tảng học tập trực tuyến thông minh. Chúng tôi ứng dụng công nghệ tương tác ảo để mang đến trải nghiệm giáo dục cá nhân hóa, giúp học viên tiếp thu tri thức mọi lúc.',
        websiteUrl: 'https://edutechhub.vn',
        address: '101 Hùng Vương, Hải Phòng',
        city: 'Hải Phòng',
        province: 'Hải Phòng',
        phone: '031-2345-678',
        email: 'contact@edutechhub.vn',
        foundedYear: 2025,
        companySize: 'SMALL_11_50',
        logoUrl: 'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/edutech_at3tjt.jpg',
      },
      {
        companyName: 'HealthCare Plus',
        companySlug: 'healthcare-plus',
        description:
          'HealthCare Plus mang những ứng dụng tiên tiến nhất vào lĩnh vực y tế thông qua hệ thống quản lý bệnh viện và theo dõi sức khỏe từ xa. Sứ mệnh của chúng tôi là cải thiện chất lượng chăm sóc người bệnh, tối ưu quy trình khám chữa bệnh hiện đại.',
        websiteUrl: 'https://healthcareplus.vn',
        address: '321 Lý Thường Kiệt, Cầu Giấy',
        city: 'Hà Nội',
        province: 'Hà Nội',
        phone: '024-5678-901',
        email: 'info@healthcareplus.vn',
        foundedYear: 2017,
        companySize: 'ENTERPRISE_500_PLUS',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/healthcare_nbto8r.jpg',
      },
      {
        companyName: 'LogiTech',
        companySlug: 'logitech',
        description:
          'Với mạng lưới vận hành đa dạng, LogiTech ứng dụng thành công trí tuệ nhân tạo vào quản lý chuỗi cung ứng. Hệ thống phần mềm của chúng tôi giúp doanh nghiệp tối ưu nguồn lực, rút ngắn tối đa thời gian giao nhận và tăng cường hiệu suất vận tải.',
        websiteUrl: 'https://logitech.vn',
        address: '654 Nguyễn Trãi, Thanh Xuân',
        city: 'Hà Nội',
        province: 'Hà Nội',
        phone: '024-3456-789',
        email: 'support@logitech.vn',
        foundedYear: 2025,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192752/logitech_l06lm5.png',
      },
      {
        companyName: 'RetailMaster',
        companySlug: 'retail-master',
        description:
          'RetailMaster cung cấp nền tảng bán lẻ đa kênh hiện đại nhằm kết nối người mua và người bán một cách liền mạch. Các giải pháp do chúng tôi thiết kế giúp tối ưu quy trình bán hàng, quản lý kho bãi chính xác và nâng cao trải nghiệm mua sắm.',
        websiteUrl: 'https://retailmaster.vn',
        address: '987 Hai Bà Trưng, Ninh Kiều',
        city: 'Cần Thơ',
        province: 'Cần Thơ',
        phone: '0292-8765-432',
        email: 'contact@retailmaster.vn',
        foundedYear: 2016,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192752/retailmaster_gr2lme.png',
      },
      {
        companyName: 'SmartBuild',
        companySlug: 'smart-build',
        description:
          'SmartBuild là đơn vị dẫn đầu trong công nghệ xây dựng thông minh (PropTech), chuyên số hóa công tác thiết kế và quản lý các công trình kiến trúc. Chúng tôi giúp các nhà thầu kiểm soát dự án chặt chẽ, rút ngắn thời gian và tối ưu nguyên vật liệu.',
        websiteUrl: 'https://smartbuild.vn',
        address: '258 Lê Đại Hành, Liên Chiểu',
        city: 'Đà Nẵng',
        province: 'Đà Nẵng',
        phone: '0236-7890-123',
        email: 'info@smartbuild.vn',
        foundedYear: 2025,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192753/smartbuild_t6uffi.png',
      },
      {
        companyName: 'CyberSec',
        companySlug: 'cyber-sec',
        description:
          'CyberSec là tổ chức nghiên cứu và cung cấp giải pháp bảo mật mạng chuyên sâu, bảo vệ khối dữ liệu nhạy cảm của các tập đoàn vừa và lớn. Đội ngũ chuyên gia an ninh mạng của chúng tôi liên tục rà soát rủi ro và đánh chặn lỗ hổng.',
        websiteUrl: 'https://cybersec.vn',
        address: '147 Trần Hưng Đạo, Hải Châu',
        city: 'Đà Nẵng',
        province: 'Đà Nẵng',
        phone: '0236-6543-210',
        email: 'support@cybersec.vn',
        foundedYear: 2015,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/cybersec_bherxg.jpg',
      },
      {
        companyName: 'TravelEasy',
        companySlug: 'travel-easy',
        description:
          'Nhằm tối ưu hóa trải nghiệm xê dịch, TravelEasy đem lại giải pháp đặt vé, phòng khách sạn và lên kế hoạch du lịch cực kỳ cá nhân hóa. Sứ mệnh của chúng tôi là áp dụng công nghệ số để mọi chuyến đi trở nên dễ dàng và thư giãn tuyệt đối.',
        websiteUrl: 'https://traveleasy.vn',
        address: '369 Hoàng Văn Thụ, Tân Bình',
        city: 'Hồ Chí Minh',
        province: 'Hồ Chí Minh',
        phone: '028-4321-876',
        email: 'contact@traveleasy.vn',
        foundedYear: 2025,
        companySize: 'SMALL_11_50',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192978/traveleasy_v2f1ur.png',
      },
      {
        companyName: 'AgriTech',
        companySlug: 'agri-tech',
        description:
          'AgriTech tự hào là công ty nông nghiệp công nghệ cao, ứng dụng phần mềm phân tích dữ liệu cánh đồng và tự động hóa khâu tưới tiêu. Chúng tôi mong muốn hỗ trợ người nông dân gia tăng năng suất mùa vụ và mở ra kỷ nguyên nông nghiệp xanh.',
        websiteUrl: 'https://agritech.vn',
        address: '852 Nguyễn Văn Cừ, Ninh Kiều',
        city: 'Cần Thơ',
        province: 'Cần Thơ',
        phone: '0292-3456-789',
        email: 'info@agritech.vn',
        foundedYear: 2019,
        companySize: 'MEDIUM_51_200',
        logoUrl:
          'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/agritech_yv2wsq.png',
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

      await prisma.companyUser.create({
        data: {
          companyId: company.id,
          userId: employers[i % employers.length].id,
          role: 'ADMIN',
          isPrimaryContact: true,
        },
      });
    }

    // 6. Jobs
    console.log('💼 Tạo Jobs theo phân loại...');
    const jobTemplates = [
      { t: 'Senior Frontend ReactJS', c: 'frontend' },
      { t: 'Frontend Developer (NextJS)', c: 'frontend' },
      { t: 'Web UI Developer (JS/TS)', c: 'frontend' },
      { t: 'Backend Developer (Node.js)', c: 'backend' },
      { t: 'Java Backend System', c: 'backend' },
      { t: 'DevOps / Backend Python', c: 'backend' },
      { t: 'Senior UI/UX Designer', c: 'design' },
      { t: 'Product Designer', c: 'design' },
      { t: 'Frontend Engineer (React/Vue)', c: 'frontend' },
      { t: 'Backend Engineer (C# .NET)', c: 'backend' },
      { t: 'Full-stack JS Developer', c: 'frontend' },
      { t: 'UI/UX Visual Designer', c: 'design' },
      { t: 'Database Administrator', c: 'backend' },
      { t: 'System Architect', c: 'backend' },
      { t: 'Creative Director', c: 'design' },
      { t: 'Junior Frontend Developer', c: 'frontend' },
      { t: 'Senior Node.js Backend', c: 'backend' },
      { t: 'Lead Product Designer', c: 'design' },
      { t: 'Mobile App Developer (React Native)', c: 'frontend' },
      { t: 'Backend Python Engineer', c: 'backend' },
    ];

    const jobs = [];
    for (let i = 0; i < jobTemplates.length; i++) {
      const company = companies[i % companies.length];
      const employer = employers[i % employers.length];

      const job = await prisma.job.create({
        data: {
          companyId: company.id,
          recruiterId: employer.id,
          title: jobTemplates[i].t,
          slug: `job-${jobTemplates[i].c}-${i}`,
          description: `Mô tả công việc cho vị trí ${jobTemplates[i].t}.`,
          requirements: 'Yêu cầu công việc.',
          jobType: 'FULL_TIME',
          workLocationType: 'ONSITE',
          experienceLevel: 'MID',
          salaryMin: getRandomNumber(1000, 2000) * 10000,
          salaryMax: getRandomNumber(2000, 4000) * 10000,
          currency: 'VND',
          locationCity: company.city,
          locationProvince: company.province,
          status: 'ACTIVE',
          publishedAt: new Date(),
          viewCount: getRandomNumber(10, 50),
          applicationCount: 0,
        },
      });

      const groupSkillIds = mapSkillIds(skillGroups[jobTemplates[i].c]);
      if (groupSkillIds.length > 0) {
        await prisma.jobSkill.createMany({
          data: groupSkillIds.map((skillId) => ({
            jobId: job.id,
            skillId: skillId,
            requiredLevel: 'REQUIRED', // Explicitly setting this per schema constraints
          })),
        });
      }

      // Random category
      await prisma.jobCategory.create({
        data: {
          jobId: job.id,
          categoryId: createdCategories[i % createdCategories.length].id,
        },
      });

      jobs.push({ id: job.id, group: jobTemplates[i].c, title: jobTemplates[i].t });
    }

    // 7. Behavioural Network Overlaps (Views, Saves, Applications)
    console.log('📋 Tạo Mạng Lưới Hành Vi (Views/Saves/Applies)...');

    for (const groupName of ['frontend', 'backend', 'design']) {
      const groupCandidates = candidates.filter((c) => c.group === groupName);
      const groupJobs = jobs.filter((j) => j.group === groupName);

      for (const candidate of groupCandidates) {
        // Cross-interactions - 3-5 random jobs within their specialized group to build overlap
        const interactJobs = groupJobs.sort(() => 0.5 - Math.random()).slice(0, 5);
        for (const job of interactJobs) {
          // Must provide ipAddress & userAgent per schema fix
          await prisma.jobView.create({
            data: {
              jobId: job.id,
              userId: candidate.id,
              viewedAt: getRandomDate(),
              ipAddress: `192.168.1.${getRandomNumber(1, 255)}`,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            },
          });

          // Some randomness for saved jobs
          if (Math.random() > 0.4) {
            await prisma.savedJob.create({
              data: {
                jobId: job.id,
                candidateId: candidate.candidate.id,
                createdAt: getRandomDate(),
              },
            });
          }

          // Randomness for applications
          if (Math.random() > 0.6) {
            const app = await prisma.application.create({
              data: {
                jobId: job.id,
                candidateId: candidate.candidate.id,
                userId: candidate.id,
                status: 'APPLIED',
                appliedAt: getRandomDate(),
              },
            });

            await prisma.applicationTimeline.create({
              data: {
                application: { connect: { id: app.id } },
                user: { connect: { id: candidate.id } },
                status: 'APPLIED',
                note: 'Applied via Auto System',
              },
            });
          }
        }
      }
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
          viewedAt: getRandomDate(new Date(2025, 0, 1), new Date()),
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

    console.log('✅ Seed database hoàn thành!');
    console.log(`
📊 Thống kê Refactored Database:
- Industries: ${createdIndustries.length}
- Categories: ${createdCategories.length}
- Skills: ${createdSkills.length}
- Users: ${candidates.length + employers.length + 1} (1 Admin, ${employers.length} Employers, ${candidates.length} Candidates)
- Companies: ${companies.length}
- Jobs: ${jobs.length}

🔑 Test Accounts:
Admin: admin@careerconnect.com / admin123
Candidate (Frontend): nguyenvana@gmail.com / fe1@gmail.com / 123456
Candidate (Backend): tranthib@gmail.com / be1@gmail.com / 123456
Candidate (Design): levanc@gmail.com / ui1@gmail.com / 123456
Employer: hr@techcorp.com / 123456
    `);
  } catch (error) {
    console.error('❌ Lỗi khi seed database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
