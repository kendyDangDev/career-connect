const fs = require('fs');
const p = 'c:/Users/KendyDang/Documents/career-connect/apps/web/scripts/seed-database.js';
let content = fs.readFileSync(p, 'utf8');

const updates = {
  'techcorp-vietnam': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192754/Tech_Corps_-_color_logo_400x_prrzhc.webp'",
    foundedYear: 2015
  },
  'innovate-solutions': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192813/techinno_wsjdqw.jpg'",
    foundedYear: 2018
  },
  'fintech-pro': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192723/fintech_jmsgt0.jpg'",
    foundedYear: 2025
  },
  'tech-innovate': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192813/techinno_wsjdqw.jpg'",
    foundedYear: 2018
  },
  'green-solutions': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/greensolution_g1icts.jpg'",
    foundedYear: 2019
  },
  'edutech-hub': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/edutech_at3tjt.jpg'",
    foundedYear: 2025
  },
  'healthcare-plus': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/healthcare_nbto8r.jpg'",
    foundedYear: 2017
  },
  'logitech': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192752/logitech_l06lm5.png'",
    foundedYear: 2025
  },
  'retail-master': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192752/retailmaster_gr2lme.png'",
    foundedYear: 2016
  },
  'smart-build': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192753/smartbuild_t6uffi.png'",
    foundedYear: 2025
  },
  'cyber-sec': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/cybersec_bherxg.jpg'",
    foundedYear: 2015
  },
  'travel-easy': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192978/traveleasy_v2f1ur.png'",
    foundedYear: 2025
  },
  'agri-tech': {
    logoUrl: "'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1774192724/agritech_yv2wsq.png'",
    foundedYear: 2019
  }
};

for (const [slug, data] of Object.entries(updates)) {
  const regex = new RegExp(`(companySlug:\\s*'${slug}'[\\s\\S]*?foundedYear:\\s*)\\d+(,[\\s\\S]*?logoUrl:\\s*)['"\`].*?['"\`]`, 'g');
  content = content.replace(regex, `$1${data.foundedYear}$2${data.logoUrl}`);
}

fs.writeFileSync(p, content);
console.log('Logo URLs and Founded Years updated successfully!');
