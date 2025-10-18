import Joi from 'joi';

// User registration validation
export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base':
        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
      'any.required': 'Mật khẩu là bắt buộc',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Xác nhận mật khẩu không khớp',
    'any.required': 'Xác nhận mật khẩu là bắt buộc',
  }),

  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/
    )
    .required()
    .messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được vượt quá 50 ký tự',
      'string.pattern.base': 'Tên chỉ được chứa chữ cái và khoảng trắng',
      'any.required': 'Tên là bắt buộc',
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/
    )
    .required()
    .messages({
      'string.min': 'Họ phải có ít nhất 2 ký tự',
      'string.max': 'Họ không được vượt quá 50 ký tự',
      'string.pattern.base': 'Họ chỉ được chứa chữ cái và khoảng trắng',
      'any.required': 'Họ là bắt buộc',
    }),

  phone: Joi.string()
    .allow('')
    .pattern(/^(\+84|84|0)[35789][0-9]{8}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ (VD: 0901234567)',
    }),

  dateOfBirth: Joi.date().max('now').min('1900-01-01').allow('').optional().messages({
    'date.max': 'Ngày sinh không được là ngày trong tương lai',
    'date.min': 'Ngày sinh không hợp lệ',
  }),

  acceptTerms: Joi.boolean().valid(true).required().messages({
    'any.only': 'Bạn phải đồng ý với điều khoản sử dụng',
    'any.required': 'Bạn phải đồng ý với điều khoản sử dụng',
  }),

  acceptPrivacy: Joi.boolean().valid(true).required().messages({
    'any.only': 'Bạn phải đồng ý với chính sách bảo mật',
    'any.required': 'Bạn phải đồng ý với chính sách bảo mật',
  }),
});

// Login validation
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),

  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc',
  }),

  rememberMe: Joi.boolean().optional(),
  redirect: Joi.boolean().optional(), // NextAuth sends this field
  csrfToken: Joi.string().optional(), // NextAuth sends this field
  callbackUrl: Joi.string().optional(), // NextAuth sends this field
  json: Joi.string().optional(), // NextAuth sends this field
}).options({ allowUnknown: true }); // Allow unknown fields from NextAuth

// Email verification
export const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token xác thực là bắt buộc',
  }),
});

// Phone verification
export const verifyPhoneSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^(\+84|84|0)[35789][0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ',
      'any.required': 'Số điện thoại là bắt buộc',
    }),

  token: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'Mã xác thực phải có 6 chữ số',
      'string.pattern.base': 'Mã xác thực chỉ được chứa số',
      'any.required': 'Mã xác thực là bắt buộc',
    }),
});

// Send phone verification
export const sendPhoneVerificationSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^(\+84|84|0)[35789][0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ',
      'any.required': 'Số điện thoại là bắt buộc',
    }),
});

// Reset password request
export const resetPasswordRequestSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),
});

// Reset password confirm
export const resetPasswordConfirmSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token đặt lại mật khẩu là bắt buộc',
  }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base':
        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
      'any.required': 'Mật khẩu là bắt buộc',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Xác nhận mật khẩu không khớp',
    'any.required': 'Xác nhận mật khẩu là bắt buộc',
  }),
});

// Profile update schema
export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/
    )
    .optional(),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/
    )
    .optional(),

  phone: Joi.string()
    .pattern(/^(\+84|84|0)[35789][0-9]{8}$/)
    .optional()
    .allow(''),

  dateOfBirth: Joi.date().max('now').min('1900-01-01').optional().allow(null),

  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY').optional().allow(''),

  bio: Joi.string().max(500).optional().allow(''),

  address: Joi.string().max(200).optional().allow(''),

  city: Joi.string().max(100).optional().allow(''),

  province: Joi.string().max(100).optional().allow(''),

  websiteUrl: Joi.string().uri().optional().allow(''),

  linkedinUrl: Joi.string().uri().optional().allow(''),

  githubUrl: Joi.string().uri().optional().allow(''),

  portfolioUrl: Joi.string().uri().optional().allow(''),
});
