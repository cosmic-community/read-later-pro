import type { Article, User } from '@/types'

interface MailgunResponse {
  id: string
  message: string
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

export class EmailService {
  private apiKey: string
  private domain: string
  private fromEmail: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.MAILGUN_API_KEY as string
    this.domain = process.env.MAILGUN_DOMAIN as string
    this.fromEmail = process.env.MAILGUN_FROM_EMAIL as string
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL as string

    if (!this.apiKey || !this.domain || !this.fromEmail) {
      throw new Error('Missing required Mailgun environment variables')
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const formData = new FormData()
      formData.append('from', this.fromEmail)
      formData.append('to', options.to)
      formData.append('subject', options.subject)
      formData.append('html', options.html)
      formData.append('text', options.text)

      const response = await fetch(`https://api.mailgun.net/v3/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Mailgun API error:', errorText)
        return {
          success: false,
          error: `Failed to send email: ${response.status} ${response.statusText}`
        }
      }

      const result = await response.json() as MailgunResponse
      return {
        success: true,
        messageId: result.id
      }
    } catch (error) {
      console.error('Email sending error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async sendDigestEmail(
    user: Pick<User, 'metadata'> & { title: string },
    articles: Article[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!articles.length) {
      return { success: false, error: 'No articles to send' }
    }

    const subject = `Your Read Later Digest - ${articles.length} article${articles.length > 1 ? 's' : ''}`
    const html = this.generateDigestHTML(user, articles)
    const text = this.generateDigestText(user, articles)

    return this.sendEmail({
      to: user.metadata.email,
      subject,
      html,
      text
    })
  }

  async sendTestDigestEmail(
    recipientEmail: string,
    articles: Article[],
    user?: Pick<User, 'metadata'> & { title: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const testUser = user || {
      title: 'Test User',
      metadata: {
        email: recipientEmail,
        name: 'Test User',
        subscription_tier: 'free' as const,
        articles_limit: 5,
        email_grouping: 'mixed' as const,
        include_summaries: true,
        default_email_time: '9:00 AM',
        articles_saved_this_week: articles.length,
        total_articles_read: 0,
        account_created: new Date().toISOString()
      }
    }

    const subject = `[TEST] Your Read Later Digest - ${articles.length} article${articles.length > 1 ? 's' : ''}`
    const html = this.generateDigestHTML(testUser, articles, true)
    const text = this.generateDigestText(testUser, articles, true)

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
      text
    })
  }

  private generateDigestHTML(
    user: Pick<User, 'metadata'> & { title: string },
    articles: Article[],
    isTest = false
  ): string {
    const userName = user.metadata.name || user.title || 'Reader'
    const testBadge = isTest ? '<div style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; margin-bottom: 24px; text-align: center;">TEST EMAIL</div>' : ''
    
    const articlesHTML = articles.map(article => {
      const tags = Array.isArray(article.metadata.tags) ? article.metadata.tags : []
      const tagsHTML = tags.length > 0 
        ? `<div style="margin-top: 8px;">
             ${tags.map(tag => `<span style="background: #e5e7eb; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 4px;">${tag}</span>`).join('')}
           </div>`
        : ''

      const descriptionHTML = user.metadata.include_summaries && article.metadata.description
        ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 8px 0 0 0;">${article.metadata.description}</p>`
        : ''

      const readTime = article.metadata.estimated_read_time 
        ? `<span style="color: #9ca3af; font-size: 12px;"> • ${article.metadata.estimated_read_time} min read</span>`
        : ''

      const trackingUrl = `${this.baseUrl}/track/click?article=${encodeURIComponent(article.id)}&user=${encodeURIComponent(user.metadata.email)}&url=${encodeURIComponent(article.metadata.url)}`

      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: white;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
            <a href="${trackingUrl}" style="color: #1f2937; text-decoration: none;" target="_blank">
              ${article.metadata.title || article.title}
            </a>
          </h3>
          <div style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">
            ${article.metadata.domain || new URL(article.metadata.url).hostname}${readTime}
          </div>
          ${descriptionHTML}
          ${tagsHTML}
        </div>
      `
    }).join('')

    const groupedArticles = this.groupArticles(articles, user.metadata.email_grouping)
    const groupedHTML = this.generateGroupedHTML(groupedArticles, user)

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Read Later Digest</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          ${testBadge}
          
          <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">
              📚 Your Read Later Digest
            </h1>
            <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 16px;">
              Hi ${userName}! Here are your ${articles.length} saved article${articles.length > 1 ? 's' : ''} ready to read.
            </p>
            
            ${user.metadata.email_grouping && user.metadata.email_grouping !== 'mixed' ? groupedHTML : articlesHTML}
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <a href="${this.baseUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block;">
                View All Articles
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>
              Sent by <a href="${this.baseUrl}" style="color: #3b82f6; text-decoration: none;">Read Later Pro</a>
              <br>
              <a href="${this.baseUrl}/unsubscribe?email=${encodeURIComponent(user.metadata.email)}" style="color: #9ca3af; text-decoration: none;">Unsubscribe</a>
            </p>
            <img src="${this.baseUrl}/track/open?user=${encodeURIComponent(user.metadata.email)}" width="1" height="1" style="display: block; margin: 0 auto;" alt="">
          </div>
        </body>
      </html>
    `
  }

  private generateDigestText(
    user: Pick<User, 'metadata'> & { title: string },
    articles: Article[],
    isTest = false
  ): string {
    const userName = user.metadata.name || user.title || 'Reader'
    const testPrefix = isTest ? '[TEST EMAIL]\n\n' : ''
    
    const articlesText = articles.map((article, index) => {
      const tags = Array.isArray(article.metadata.tags) ? article.metadata.tags : []
      const tagsText = tags.length > 0 ? `\nTags: ${tags.join(', ')}` : ''
      const descriptionText = user.metadata.include_summaries && article.metadata.description
        ? `\n${article.metadata.description}`
        : ''
      const readTime = article.metadata.estimated_read_time 
        ? ` (${article.metadata.estimated_read_time} min read)`
        : ''

      return `${index + 1}. ${article.metadata.title || article.title}${readTime}
   ${article.metadata.url}
   Source: ${article.metadata.domain || new URL(article.metadata.url).hostname}${descriptionText}${tagsText}
`
    }).join('\n')

    return `${testPrefix}📚 Your Read Later Digest

Hi ${userName}!

Here are your ${articles.length} saved article${articles.length > 1 ? 's' : ''} ready to read:

${articlesText}

View all your articles: ${this.baseUrl}

---
Sent by Read Later Pro (${this.baseUrl})
Unsubscribe: ${this.baseUrl}/unsubscribe?email=${encodeURIComponent(user.metadata.email)}
`
  }

  private groupArticles(articles: Article[], grouping?: string): { [key: string]: Article[] } {
    if (!grouping || grouping === 'mixed') {
      return { 'Your Articles': articles }
    }

    if (grouping === 'by_category') {
      const grouped: { [key: string]: Article[] } = {}
      
      articles.forEach(article => {
        const tags = Array.isArray(article.metadata.tags) ? article.metadata.tags : []
        const category = tags.length > 0 ? tags[0] : 'Uncategorized'
        
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(article)
      })
      
      return grouped
    }

    if (grouping === 'by_date_added') {
      const grouped: { [key: string]: Article[] } = {}
      
      articles.forEach(article => {
        const date = new Date(article.metadata.date_added)
        const dateKey = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(article)
      })
      
      return grouped
    }

    return { 'Your Articles': articles }
  }

  private generateGroupedHTML(
    groupedArticles: { [key: string]: Article[] },
    user: Pick<User, 'metadata'> & { title: string }
  ): string {
    return Object.entries(groupedArticles).map(([groupName, articles]) => {
      const articlesHTML = articles.map(article => {
        // Fix: Add proper null checks for metadata
        const articleMetadata = article.metadata
        if (!articleMetadata) {
          return `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: white;">
              <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                <a href="#" style="color: #1f2937; text-decoration: none;" target="_blank">
                  ${article.title || 'Untitled'}
                </a>
              </h4>
            </div>
          `
        }

        const tags = Array.isArray(articleMetadata.tags) ? articleMetadata.tags : []
        const tagsHTML = tags.length > 0 
          ? `<div style="margin-top: 8px;">
               ${tags.map(tag => `<span style="background: #e5e7eb; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 4px;">${tag}</span>`).join('')}
             </div>`
          : ''

        const userMetadata = user.metadata
        const descriptionHTML = userMetadata && userMetadata.include_summaries && articleMetadata.description
          ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 8px 0 0 0;">${articleMetadata.description}</p>`
          : ''

        const readTime = articleMetadata.estimated_read_time 
          ? `<span style="color: #9ca3af; font-size: 12px;"> • ${articleMetadata.estimated_read_time} min read</span>`
          : ''

        const articleUrl = articleMetadata.url || ''
        const userEmail = userMetadata ? userMetadata.email : ''
        const articleId = article.id || ''
        
        // Only create tracking URL if we have valid article ID, user email, and article URL
        const trackingUrl = articleId && userEmail && articleUrl 
          ? `${this.baseUrl}/track/click?article=${encodeURIComponent(articleId)}&user=${encodeURIComponent(userEmail)}&url=${encodeURIComponent(articleUrl)}`
          : articleUrl

        const domain = articleMetadata.domain || (articleUrl ? ((() => {
          try {
            return new URL(articleUrl).hostname
          } catch {
            return ''
          }
        })()) : '')

        return `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: white;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
              <a href="${trackingUrl}" style="color: #1f2937; text-decoration: none;" target="_blank">
                ${articleMetadata.title || article.title || 'Untitled'}
              </a>
            </h4>
            <div style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">
              ${domain}${readTime}
            </div>
            ${descriptionHTML}
            ${tagsHTML}
          </div>
        `
      }).join('')

      return `
        <div style="margin-bottom: 32px;">
          <h3 style="color: #374151; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
            ${groupName}
          </h3>
          ${articlesHTML}
        </div>
      `
    }).join('')
  }
}

export const emailService = new EmailService()