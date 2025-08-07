# Read Later Pro

![Read Later Pro](https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=300&fit=crop&auto=format)

A comprehensive read-later application that helps you save articles, schedule email deliveries, and manage your reading workflow. Built with Next.js and Cosmic CMS for seamless content management and email automation.

## ✨ Features

- **Smart Article Saving**: Paste URLs to automatically extract article metadata
- **Visual Scheduling**: Calendar interface with flexible date/time selection
- **Advanced Organization**: Tag-based filtering and status management
- **Bulk Operations**: Schedule multiple articles with a single action
- **Usage Analytics**: Track reading progress and subscription limits
- **Email Customization**: Configure delivery preferences and digest formats
- **Mobile Responsive**: Optimized for mobile article sharing
- **Real-time Updates**: Live status updates and batch tracking

## Clone this Bucket and Code Repository

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Bucket and Code Repository](https://img.shields.io/badge/Clone%20this%20Bucket-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmic-staging.com/projects/new?clone_bucket=6894ef88d88e61992bc79bd8&clone_repository=6894f9c2d88e61992bc79bf1)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> are you able to access all of the other projects built on Cosmic for reference?

### Code Generation Prompt

> I need to build a web interface for a "read-later" application that allows users to save articles from URLs, schedule them for email delivery, and manage their reading lists. The backend uses Cosmic CMS for content management and Mailgun for email delivery.

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠 Technologies Used

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Content Management**: Cosmic CMS
- **Database**: Cosmic CMS Objects
- **Language**: TypeScript
- **Package Manager**: Bun
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Cosmic account with read/write access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd read-later-pro
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   COSMIC_BUCKET_SLUG=your-bucket-slug
   COSMIC_READ_KEY=your-read-key
   COSMIC_WRITE_KEY=your-write-key
   ```

5. **Run the development server**
   ```bash
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Cosmic SDK Examples

### Fetch Articles
```typescript
const articles = await cosmic.objects
  .find({ type: 'articles' })
  .props(['id', 'title', 'slug', 'metadata'])
  .depth(1);
```

### Create New Article
```typescript
await cosmic.objects.insertOne({
  type: 'articles',
  title: metadata.title,
  slug: generateSlug(metadata.title),
  metadata: {
    title: metadata.title,
    url: url,
    description: metadata.description,
    domain: metadata.domain,
    status: 'scheduled',
    date_added: new Date().toISOString(),
    user_id: userId
  }
});
```

### Update Article Status
```typescript
await cosmic.objects.updateOne(articleId, {
  metadata: {
    status: 'read',
    email_sent_date: new Date().toISOString()
  }
});
```

## 🎯 Cosmic CMS Integration

This application integrates with your existing Cosmic object types:

- **Articles**: Main content objects with URL, scheduling, and status tracking
- **Users**: User profiles with subscription tiers and preferences
- **Email Batches**: Email delivery tracking and analytics
- **Shared Lists**: Collaborative article lists and sharing

All CRUD operations are handled through the Cosmic SDK with proper error handling and validation.

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Netlify
1. Build the application: `bun run build`
2. Deploy the `out` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Environment Variables for Production
Set these in your hosting platform:
- `COSMIC_BUCKET_SLUG`: Your Cosmic bucket slug
- `COSMIC_READ_KEY`: Your Cosmic read key
- `COSMIC_WRITE_KEY`: Your Cosmic write key

## 📱 Usage

1. **Save Articles**: Paste URLs in the quick-add form
2. **Schedule Delivery**: Use the calendar to set delivery dates
3. **Organize**: Add tags and filter articles by status
4. **Bulk Actions**: Select multiple articles for batch operations
5. **Track Progress**: Monitor reading statistics and usage

<!-- README_END -->