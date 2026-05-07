import { defineConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  ignoreDeadLinks: true,
  vite: {
    plugins: [tailwindcss()]
  },
  title: "Awesome NZ",
  description: "A VitePress Site",

  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        langMenuLabel: '切换语言',
        nav: [
          { text: '首页', link: '/' },
          { text: '指南', link: '/pre-departure-medical' }
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '出国体检 - 胸片', link: '/pre-departure-medical' },
              {
                text: '无犯罪记录证明',
                link: '/criminal-record',
                items: [
                  {
                    text: '中国',
                    link: '/criminal-record/china',
                    items: [
                      { text: '广东省', link: '/criminal-record/china/guangdong' },
                      { text: '河北省', link: '/criminal-record/china/hebei' }
                    ]
                  },
                  {
                    text: '新西兰',
                    link: '/criminal-record/newzealand',
                    items: [
                      { text: '奥克兰', link: '/criminal-record/newzealand/auckland' }
                    ]
                  }
                ]
              },
              {
                text: '银行流水',
                link: '/bank-statement',
                items: [
                  { text: 'ANZ', link: '/bank-statement/anz' },
                  { text: 'BNZ', link: '/bank-statement/bnz' },
                  { text: 'Kiwibank', link: '/bank-statement/kiwibank' },
                  { text: '招商银行', link: '/bank-statement/cmb' }
                ]
              },
              {
                text: '看病',
                link: '/medical-care',
                items: [
                  { text: 'GP（家庭医生）', link: '/medical-care/gp' },
                  {
                    text: '急诊',
                    link: '/medical-care/emergency',
                    items: [
                      { text: 'White Cross', link: '/medical-care/emergency/white-cross' }
                    ]
                  },
                  {
                    text: '看病报销',
                    link: '/medical-care/reimbursement',
                    items: [
                      { text: '学生保险', link: '/medical-care/reimbursement/student-insurance' }
                    ]
                  }
                ]
              },
              {
                text: '签证',
                link: '/visa',
                items: [
                  {
                    text: '学生签证',
                    link: '/visa/student-visas/student-visa'
                  },
                  {
                    text: '毕业后工签',
                    link: '/visa/work-visas/post-study-work-visa',
                    items: [
                      { text: '体检', link: '/visa/work-visas/post-study-work-visa/medical-examination' },
                      { text: 'Completion Letter', link: '/visa/work-visas/post-study-work-visa/completion-letter' },
                      { text: '移民局在线申请', link: '/visa/work-visas/post-study-work-visa/immigration-application' }
                    ]
                  }
                ]
              },
            ]
          }
        ]
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        langMenuLabel: 'Change language',
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guides', link: '/en/pre-departure-medical' }
        ],
        sidebar: [
          {
            text: 'Guides',
            items: [
              { text: 'Pre-departure Medical Exam - Chest X-ray', link: '/en/pre-departure-medical' },
              {
                text: 'Criminal Record Certificate',
                link: '/en/criminal-record',
                items: [
                  {
                    text: 'China',
                    link: '/en/criminal-record/china',
                    items: [
                      { text: 'Guangdong Province', link: '/en/criminal-record/china/guangdong' },
                      { text: 'Hebei Province', link: '/en/criminal-record/china/hebei' }
                    ]
                  },
                  {
                    text: 'New Zealand',
                    link: '/en/criminal-record/newzealand',
                    items: [
                      { text: 'Auckland', link: '/en/criminal-record/newzealand/auckland' }
                    ]
                  }
                ]
              },
              {
                text: 'Bank Statements',
                link: '/en/bank-statement',
                items: [
                  { text: 'ANZ', link: '/en/bank-statement/anz' },
                  { text: 'BNZ', link: '/en/bank-statement/bnz' },
                  { text: 'Kiwibank', link: '/en/bank-statement/kiwibank' },
                  { text: 'China Merchants Bank', link: '/en/bank-statement/cmb' }
                ]
              },
              {
                text: 'Medical Care',
                link: '/en/medical-care',
                items: [
                  { text: 'GP (General Practitioner)', link: '/en/medical-care/gp' },
                  {
                    text: 'Emergency Care',
                    link: '/en/medical-care/emergency',
                    items: [
                      { text: 'White Cross', link: '/en/medical-care/emergency/white-cross' }
                    ]
                  },
                  {
                    text: 'Medical Reimbursement',
                    link: '/en/medical-care/reimbursement',
                    items: [
                      { text: 'Student Insurance', link: '/en/medical-care/reimbursement/student-insurance' }
                    ]
                  }
                ]
              },
              {
                text: 'Visas',
                link: '/en/visa',
                items: [
                  {
                    text: 'Student Visa',
                    link: '/en/visa/student-visas/student-visa'
                  },
                  {
                    text: 'Post-study Work Visa',
                    link: '/en/visa/work-visas/post-study-work-visa',
                    items: [
                      { text: 'Medical Exam', link: '/en/visa/work-visas/post-study-work-visa/medical-examination' },
                      { text: 'Completion Letter', link: '/en/visa/work-visas/post-study-work-visa/completion-letter' },
                      { text: 'Immigration New Zealand Online Application', link: '/en/visa/work-visas/post-study-work-visa/immigration-application' }
                    ]
                  }
                ]
              },
            ]
          }
        ]
      }
    }
  },

  themeConfig: {
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Bald-M/AwesomeNZ' }
    ]
  }
})
