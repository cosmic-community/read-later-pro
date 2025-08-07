import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

// Mock email service for testing - replace with your actual email service
async function sendTestEmail(userEmail: string, articles: any[]) {
  // This is where you would integrate with your actual email service
  // For now, we'll just simulate sending an email
  console.log('=== TEST EMAIL ===')
  console.log('To:', userEmail)
  console.log('Subject: Your Read Later Digest - Test Email')
  console.log('Articles to include:', articles.length)
  console.log('Articles:', articles.map(a => ({ title: a.metadata.title, url: a.metadata.url })))
  console.log('==================')
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    success: true,
    messageId: `test-${Date.now()}`,
    recipientCount: 1
  }
}

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

    // Get user data if testUserId provided, otherwise create test data
    let user
    if (testUserId) {
      try {
        const userResponse = await cosmic.objects.findOne({
          type: 'users',
          id: testUserId
        })
        user = userResponse.object
      } catch (error) {
        console.log('User not found, will use provided email')
      }
    }

    // Get recent articles for the user or create test articles
    let articles = []
    if (testUserId) {
      try {
        const articlesResponse = await cosmic.objects
          .find({
            type: 'articles',
            'metadata.user_id': testUserId,
            'metadata.status': 'scheduled'
          })
          .limit(5)
          .props(['id', 'title', 'metadata'])
          .sort('-created_at')
        
        articles = articlesResponse.objects
      } catch (error) {
        console.log('No articles found for user, creating test articles')
      }
    }

    // If no articles found, create some test articles for the email
    if (articles.length === 0) {
      articles = [
        {
          id: 'test-1',
          title: 'The Future of Web Development',
          metadata: {
            title: 'The Future of Web Development',
            url: 'https://example.com/web-development-future',
            description: 'Exploring upcoming trends and technologies in web development.',
            domain: 'example.com',
            tags: ['Technology', 'Web Development'],
            estimated_read_time: 5,
            date_added: new Date().toISOString(),
            status: 'scheduled'
          }
        },
        {
          id: 'test-2',
          title: 'Productivity Tips for Remote Work',
          metadata: {
            title: 'Productivity Tips for Remote Work',
            url: 'https://example.com/remote-work-tips',
            description: 'Essential strategies for staying productive while working from home.',
            domain: 'example.com',
            tags: ['Productivity', 'Remote Work'],
            estimated_read_time: 7,
            date_added: new Date().toISOString(),
            status: 'scheduled'
          }
        },
        {
          id: 'test-3',
          title: 'Understanding Modern JavaScript',
          metadata: {
            title: 'Understanding Modern JavaScript',
            url: 'https://example.com/modern-javascript',
            description: 'A comprehensive guide to ES6+ features and best practices.',
            domain: 'example.com',
            tags: ['Technology', 'JavaScript'],
            estimated_read_time: 10,
            date_added: new Date().toISOString(),
            status: 'scheduled'
          }
        }
      ]
    }

    // Send test email
    const emailResult = await sendTestEmail(userEmail, articles)
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      )
    }

    // Create a test email batch record if we have a user
    if (testUserId) {
      try {
        await cosmic.objects.insertOne({
          type: 'email-batches',
          title: `Test Email Batch - ${new Date().toLocaleDateString()}`,
          slug: `test-batch-${testUserId}-${Date.now()}`,
          metadata: {
            user_id: testUserId,
            sent_date: new Date().toISOString(),
            article_count: articles.length,
            batch_status: 'sent',
            email_opened: false,
            articles_clicked: [],
            mailgun_message_id: emailResult.messageId
          }
        })
      } catch (error) {
        console.log('Could not create email batch record:', error)
        // Don't fail the request if we can't create the record
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        recipient: userEmail,
        articleCount: articles.length,
        messageId: emailResult.messageId
      }
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}