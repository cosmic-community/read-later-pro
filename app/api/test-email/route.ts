import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { emailService } from '@/lib/email'
import type { Article, User } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, testUserId } = body
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    console.log('=== TEST EMAIL REQUEST ===')
    console.log('Recipient:', userEmail)
    console.log('Test User ID:', testUserId)
    console.log('==========================')

    // Get user data if testUserId provided
    let user: (User & { title: string }) | null = null
    if (testUserId) {
      try {
        const userResponse = await cosmic.objects.findOne({
          type: 'users',
          id: testUserId
        }).props(['id', 'title', 'metadata'])
        
        if (userResponse.object) {
          user = userResponse.object as User & { title: string }
          console.log('Found user:', user.metadata.email)
        }
      } catch (error) {
        console.log('User not found, will create test user data')
      }
    }

    // Get recent articles for the user or create test articles
    let articles: Article[] = []
    if (testUserId && user) {
      try {
        const articlesResponse = await cosmic.objects
          .find({
            type: 'articles',
            'metadata.user_id': testUserId
          })
          .limit(5)
          .props(['id', 'title', 'metadata', 'created_at'])
          .sort('-created_at')
        
        articles = articlesResponse.objects as Article[]
        console.log(`Found ${articles.length} articles for user`)
      } catch (error) {
        console.log('No articles found for user, creating test articles')
      }
    }

    // If no articles found, create some test articles for the email
    if (articles.length === 0) {
      const currentDate = new Date().toISOString().split('T')[0]
      
      articles = [
        {
          id: 'test-1',
          slug: 'future-of-web-development',
          title: 'The Future of Web Development',
          type: 'articles',
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          metadata: {
            title: 'The Future of Web Development',
            url: 'https://techcrunch.com/web-development-future',
            description: 'Exploring upcoming trends and technologies shaping the future of web development, including AI integration, WebAssembly, and progressive web apps.',
            domain: 'techcrunch.com',
            tags: ['Technology', 'Web Development'],
            estimated_read_time: 5,
            date_added: currentDate,
            status: 'scheduled' as const,
            user_id: testUserId || 'test-user'
          }
        },
        {
          id: 'test-2',
          slug: 'productivity-tips-remote-work',
          title: 'Productivity Tips for Remote Work',
          type: 'articles',
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          metadata: {
            title: 'Productivity Tips for Remote Work',
            url: 'https://medium.com/remote-work-tips',
            description: 'Essential strategies for staying productive while working from home, including time management techniques and workspace optimization.',
            domain: 'medium.com',
            tags: ['Productivity', 'Business'],
            estimated_read_time: 7,
            date_added: currentDate,
            status: 'scheduled' as const,
            user_id: testUserId || 'test-user'
          }
        },
        {
          id: 'test-3',
          slug: 'understanding-modern-javascript',
          title: 'Understanding Modern JavaScript',
          type: 'articles',
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          metadata: {
            title: 'Understanding Modern JavaScript',
            url: 'https://javascript.info/modern-javascript-guide',
            description: 'A comprehensive guide to ES6+ features and best practices, covering async/await, destructuring, modules, and more.',
            domain: 'javascript.info',
            tags: ['Technology', 'Education'],
            estimated_read_time: 10,
            date_added: currentDate,
            status: 'scheduled' as const,
            user_id: testUserId || 'test-user'
          }
        },
        {
          id: 'test-4',
          slug: 'health-benefits-reading',
          title: 'The Health Benefits of Reading',
          type: 'articles',
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          metadata: {
            title: 'The Health Benefits of Reading',
            url: 'https://healthline.com/reading-benefits',
            description: 'Scientific research shows how reading regularly can improve brain function, reduce stress, and enhance empathy.',
            domain: 'healthline.com',
            tags: ['Health', 'Science'],
            estimated_read_time: 6,
            date_added: currentDate,
            status: 'scheduled' as const,
            user_id: testUserId || 'test-user'
          }
        },
        {
          id: 'test-5',
          slug: 'design-thinking-principles',
          title: 'Design Thinking Principles',
          type: 'articles',
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          metadata: {
            title: 'Design Thinking Principles',
            url: 'https://designthinking.org/principles',
            description: 'Learn the fundamental principles of design thinking and how to apply them to solve complex problems creatively.',
            domain: 'designthinking.org',
            tags: ['Design', 'Business'],
            estimated_read_time: 8,
            date_added: currentDate,
            status: 'scheduled' as const,
            user_id: testUserId || 'test-user'
          }
        }
      ] as Article[]
      
      console.log('Created test articles:', articles.length)
    }

    // Send test email using Mailgun
    console.log('Sending test email via Mailgun...')
    const emailResult = await emailService.sendTestDigestEmail(
      userEmail,
      articles,
      user || undefined
    )
    
    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error)
      return NextResponse.json(
        { error: `Failed to send test email: ${emailResult.error}` },
        { status: 500 }
      )
    }

    console.log('Email sent successfully. Message ID:', emailResult.messageId)

    // Create a test email batch record if we have a user
    let batchId: string | null = null
    if (testUserId) {
      try {
        const batchResponse = await cosmic.objects.insertOne({
          type: 'email-batches',
          title: `Test Email Batch - ${new Date().toLocaleDateString()}`,
          slug: `test-batch-${testUserId}-${Date.now()}`,
          metadata: {
            user_id: testUserId,
            sent_date: new Date().toISOString().split('T')[0],
            article_count: articles.length,
            batch_status: 'sent' as const,
            email_opened: false,
            articles_clicked: [],
            mailgun_message_id: emailResult.messageId || `test-${Date.now()}`
          }
        })
        
        batchId = batchResponse.object.id
        console.log('Created email batch record:', batchId)
      } catch (error) {
        console.log('Could not create email batch record:', error)
        // Don't fail the request if we can't create the record
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully via Mailgun',
      details: {
        recipient: userEmail,
        articleCount: articles.length,
        messageId: emailResult.messageId,
        batchId,
        provider: 'Mailgun',
        domain: process.env.MAILGUN_DOMAIN
      }
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}