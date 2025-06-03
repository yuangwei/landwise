# LandWise

An AI-powered landing page generator that creates high-converting landing pages with built-in waitlist collection. Built with Next.js, PostgreSQL, and AI.

![Home](./doc.png)

## 🚀 Features

- **AI-Powered Generation**: Generate landing pages using Meta Llama 3.1 8B (free) via OpenRouter
- **Multi-round Chat Interface**: Refine your landing page through natural conversation (v0.dev style)
- **Real-time Preview**: See your landing page update in real-time as you chat
- **Waitlist Collection**: Built-in email collection with automatic backend storage
- **User Management**: Multi-user support with better-auth authentication
- **Docker Ready**: Easy deployment with Docker and Docker Compose
- **Modern Tech Stack**: Next.js 15, TypeScript, PostgreSQL, Drizzle ORM, tRPC

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: better-auth
- **AI Integration**: OpenRouter API with Meta Llama 3.1 8B
- **UI**: Tailwind CSS + llm-ui for chat interface
- **API**: tRPC for type-safe APIs
- **Deployment**: Docker + Docker Compose

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenRouter API key (free tier available)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd landingwise
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgres://username:password@localhost:5432/landingwise"
   OPENROUTER_API_KEY="your_openrouter_api_key"
   BETTER_AUTH_SECRET="your_32_character_secret_key"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Start your PostgreSQL database
   # Then run database migrations
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   Visit `http://localhost:3000` to see the application.

### Docker Deployment

1. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - LandingWise app on port 3000

3. **Run database migrations**
   ```bash
   docker-compose exec app pnpm db:push
   ```

## 📖 Usage

### Creating a Landing Page

1. **Sign up/Login** - Create an account or sign in
2. **Create Project** - Fill in project details and describe your landing page
3. **Chat & Refine** - Use the chat interface to refine your landing page
4. **Preview & Publish** - Review in the preview pane and publish when ready
5. **Collect Emails** - Share your published URL to start collecting waitlist signups

### Managing Projects

- **Dashboard**: View all your projects from the main dashboard
- **Edit**: Click "Edit" to continue working on a project
- **Publish**: Publish draft projects to make them live
- **Analytics**: View waitlist signups for each published project

### Waitlist Management

- Published landing pages automatically include waitlist collection
- Emails are stored in your database
- Access collected emails through the project management interface

## 🔧 API Configuration

### OpenRouter Setup

1. Go to [OpenRouter](https://openrouter.ai/)
2. Create an account and get your API key
3. Add the API key to your environment variables

The app uses the free Meta Llama 3.1 8B model by default. You can modify the model in `src/server/lib/simple-ai.ts`.

### Database Schema

The application uses the following main tables:
- `users` - User accounts
- `projects` - Landing page projects
- `conversations` - Chat history
- `waitlist_entries` - Collected emails
- `sessions` - Authentication sessions

## 🔐 Security

- User authentication via better-auth
- Environment variable validation
- SQL injection protection via Drizzle ORM
- XSS protection for user-generated content

## 🚀 Deployment

### Production Environment

1. Set up a PostgreSQL database
2. Configure environment variables for production
3. Build and deploy using Docker or your preferred platform

### Environment Variables

Required for production:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `BETTER_AUTH_SECRET`: 32+ character secret for authentication
- `BETTER_AUTH_URL`: Your production URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Issues

If you encounter any issues, please file them in the GitHub Issues section with:
- Clear description of the problem
- Steps to reproduce
- Environment details
- Screenshots if applicable

## 🙏 Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/)
- AI models powered by [OpenRouter](https://openrouter.ai/)
- UI components inspired by [v0.dev](https://v0.dev/)
- Chat interface using [llm-ui](https://llm-ui.com/)

