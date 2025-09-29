const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const cvTemplateClassic = {
  id: 'cv_template_classic_001',
  name: 'CV Template Cổ điển',
  category: 'Classic',
  previewImage: '/images/templates/classic-template-preview.png',
  structure: {
    sections: [
      {
        id: "personal_info",
        type: "personal_info",
        title: "Thông tin cá nhân",
        required: true,
        fields: [
          {
            id: "full_name",
            type: "text",
            label: "Họ và tên",
            placeholder: "Đặng Thắng",
            required: true
          },
          {
            id: "position",
            type: "text",
            label: "Vị trí ứng tuyển",
            placeholder: "Vị trí ứng tuyển",
            required: true
          },
          {
            id: "birth_date",
            type: "date",
            label: "Ngày sinh",
            placeholder: "DD/MM/YY",
            required: false
          },
          {
            id: "gender",
            type: "select",
            label: "Giới tính",
            options: ["Nam", "Nữ", "Khác"],
            required: false
          },
          {
            id: "phone",
            type: "tel",
            label: "Số điện thoại",
            placeholder: "0123 456 789",
            required: true
          },
          {
            id: "email",
            type: "email",
            label: "Email",
            placeholder: "dodangthang2004@gmail.com",
            required: true
          },
          {
            id: "website",
            type: "url",
            label: "Website",
            placeholder: "facebook.com/TopCV.vn",
            required: false
          },
          {
            id: "address",
            type: "text",
            label: "Địa chỉ",
            placeholder: "Quận 4, thành phố Hà Nội",
            required: false
          }
        ]
      },
      {
        id: "career_objective",
        type: "text_area",
        title: "MỤC TIÊU NGHỀ NGHIỆP",
        required: false,
        description: "Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn"
      },
      {
        id: "education",
        type: "education_list",
        title: "HỌC VẤN",
        required: true,
        fields: [
          {
            id: "start_date",
            type: "text",
            label: "Bắt đầu",
            placeholder: "Bắt đầu"
          },
          {
            id: "end_date",
            type: "text",
            label: "Kết thúc",
            placeholder: "Kết thúc"
          },
          {
            id: "school_name",
            type: "text",
            label: "Tên trường học",
            placeholder: "Tên trường học"
          },
          {
            id: "major",
            type: "text",
            label: "Ngành học / Môn học",
            placeholder: "Ngành học / Môn học"
          },
          {
            id: "description",
            type: "text_area",
            label: "Mô tả quá trình học tập hoặc thành tích của bạn",
            placeholder: "Mô tả quá trình học tập hoặc thành tích của bạn"
          }
        ]
      },
      {
        id: "work_experience",
        type: "experience_list",
        title: "KINH NGHIỆM LÀM VIỆC",
        required: true,
        fields: [
          {
            id: "start_date",
            type: "text",
            label: "Bắt đầu",
            placeholder: "Bắt đầu"
          },
          {
            id: "end_date",
            type: "text",
            label: "Kết thúc",
            placeholder: "Kết thúc"
          },
          {
            id: "company_name",
            type: "text",
            label: "Tên công ty",
            placeholder: "Tên công ty"
          },
          {
            id: "position",
            type: "text",
            label: "Vị trí công việc",
            placeholder: "Vị trí công việc"
          },
          {
            id: "job_description",
            type: "text_area",
            label: "Mô tả kinh nghiệm làm việc của bạn",
            placeholder: "Mô tả kinh nghiệm làm việc của bạn"
          }
        ]
      },
      {
        id: "activities",
        type: "activity_list",
        title: "HOẠT ĐỘNG",
        required: false,
        fields: [
          {
            id: "start_date",
            type: "text",
            label: "Bắt đầu",
            placeholder: "Bắt đầu"
          },
          {
            id: "end_date",
            type: "text",
            label: "Kết thúc",
            placeholder: "Kết thúc"
          },
          {
            id: "activity_name",
            type: "text",
            label: "Tên tổ chức",
            placeholder: "Tên tổ chức"
          },
          {
            id: "role",
            type: "text",
            label: "Vị trí của bạn",
            placeholder: "Vị trí của bạn"
          },
          {
            id: "description",
            type: "text_area",
            label: "Mô tả hoạt động",
            placeholder: "Mô tả hoạt động"
          }
        ]
      },
      {
        id: "certificates",
        type: "certificate_list",
        title: "CHỨNG CHỈ",
        required: false,
        fields: [
          {
            id: "time_period",
            type: "text",
            label: "Thời gian",
            placeholder: "Thời gian"
          },
          {
            id: "certificate_name",
            type: "text",
            label: "Tên chứng chỉ",
            placeholder: "Tên chứng chỉ"
          }
        ]
      },
      {
        id: "awards",
        type: "award_list",
        title: "DANH HIỆU VÀ GIẢI THƯỞNG",
        required: false,
        fields: [
          {
            id: "time_period",
            type: "text",
            label: "Thời gian",
            placeholder: "Thời gian"
          },
          {
            id: "award_name",
            type: "text",
            label: "Tên giải thưởng",
            placeholder: "Tên giải thưởng"
          }
        ]
      },
      {
        id: "skills",
        type: "skill_list",
        title: "KỸ NĂNG",
        required: false,
        fields: [
          {
            id: "skill_name",
            type: "text",
            label: "Tên kỹ năng",
            placeholder: "Tên kỹ năng"
          },
          {
            id: "skill_description",
            type: "text",
            label: "Mô tả kỹ năng",
            placeholder: "Mô tả kỹ năng"
          }
        ]
      },
      {
        id: "references",
        type: "reference_list",
        title: "NGƯỜI GIỚI THIỆU",
        required: false,
        description: "Thông tin người tham chiếu bao gồm tên, chức vụ và thông tin liên hệ",
        fields: [
          {
            id: "reference_info",
            type: "text_area",
            label: "Thông tin người tham chiếu",
            placeholder: "Thông tin người tham chiếu bao gồm tên, chức vụ và thông tin liên hệ"
          }
        ]
      },
      {
        id: "hobbies",
        type: "hobby_list",
        title: "SỞ THÍCH",
        required: false,
        fields: [
          {
            id: "hobby_description",
            type: "text_area",
            label: "Diễn các sở thích của bạn",
            placeholder: "Diễn các sở thích của bạn"
          }
        ]
      }
    ],
    layout: {
      type: "single_column",
      sections: ["personal_info", "career_objective", "education", "work_experience", "activities", "certificates", "awards", "skills", "references", "hobbies"]
    }
  },
  styling: {
    colors: {
      primary: "#2c3e50",
      secondary: "#34495e",
      accent: "#3498db",
      text: "#2c3e50",
      textLight: "#7f8c8d",
      background: "#ffffff",
      border: "#bdc3c7"
    },
    fonts: {
      primary: "Inter, system-ui, -apple-system, sans-serif",
      secondary: "Georgia, serif"
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px"
    },
    layout: {
      container: {
        maxWidth: "210mm",
        minHeight: "297mm",
        padding: "20px",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
      },
      leftColumn: {
        backgroundColor: "#f8f9fa",
        padding: "24px 20px",
        borderRadius: "8px",
        marginRight: "20px"
      },
      rightColumn: {
        padding: "24px 0"
      }
    },
    components: {
      avatar: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "#bdc3c7",
        marginBottom: "16px",
        border: "3px solid #ffffff"
      },
      name: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#2c3e50",
        marginBottom: "8px",
        textAlign: "center"
      },
      position: {
        fontSize: "16px",
        color: "#7f8c8d",
        textAlign: "center",
        marginBottom: "24px",
        fontStyle: "italic"
      },
      contactInfo: {
        fontSize: "14px",
        lineHeight: "1.6",
        marginBottom: "8px"
      },
      sectionTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#2c3e50",
        textTransform: "uppercase",
        borderBottom: "2px solid #3498db",
        paddingBottom: "8px",
        marginBottom: "16px",
        marginTop: "32px"
      },
      sectionContent: {
        fontSize: "14px",
        lineHeight: "1.6",
        color: "#2c3e50",
        marginBottom: "16px"
      },
      experienceItem: {
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: "1px solid #ecf0f1"
      },
      experienceTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: "4px"
      },
      experienceCompany: {
        fontSize: "14px",
        color: "#3498db",
        marginBottom: "4px"
      },
      experienceDate: {
        fontSize: "12px",
        color: "#7f8c8d",
        marginBottom: "8px"
      },
      experienceDescription: {
        fontSize: "14px",
        color: "#2c3e50",
        lineHeight: "1.5"
      }
    },
    print: {
      pageSize: "A4",
      margin: "15mm",
      colorAdjust: "exact"
    }
  },
  isPremium: false
};

async function seedCvTemplate() {
  try {
    console.log('🌱 Seeding CV template...');

    // Upsert the template (create or update if exists)
    const template = await prisma.template.upsert({
      where: { id: cvTemplateClassic.id },
      update: {
        name: cvTemplateClassic.name,
        category: cvTemplateClassic.category,
        previewImage: cvTemplateClassic.previewImage,
        structure: cvTemplateClassic.structure,
        styling: cvTemplateClassic.styling,
        isPremium: cvTemplateClassic.isPremium,
      },
      create: cvTemplateClassic,
    });

    console.log('✅ CV template seeded successfully:', template.name);
    console.log('Template ID:', template.id);

  } catch (error) {
    console.error('❌ Error seeding CV template:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedCvTemplate()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedCvTemplate };
