# AI Code Review Server

A Node.js/TypeScript backend service for AI-powered code review and refactoring.

## Features

- Code submission and storage
- AI-powered code review with style, performance, and security analysis
- AI-powered code refactoring
- Multiple AI model support (OpenAI GPT-4 and Meta Llama)
- Dynamic model selection and switching
- RESTful API endpoints
- MongoDB integration
- Redis caching
- Rate limiting
- Request validation
- Error handling
- Logging

## Prerequisites

- Node.js v18 or higher
- MongoDB
- Redis
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ai-code-review
   REDIS_URL=redis://localhost:6379
   OPENAI_API_KEY=your-api-key-here
   HUGGINGFACE_API_KEY=your-huggingface-api-key-here
   AI_MODEL=openai  # or 'llama'
   AI_TEMPERATURE=0.3
   AI_MAX_TOKENS=2048
   AI_TOP_P=0.95
   NODE_ENV=development
   LOG_LEVEL=debug
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   ```

For development:
```bash
npm run dev
```

## API Endpoints

### Submissions

- `POST /api/submissions`
  - Submit code for review/refactoring
  - Body: `{ code: string, filename?: string }`

- `GET /api/submissions/:id`
  - Get submission details

### Review

- `POST /api/review/:id`
  - Generate code review for a submission
  - Returns: `{ categories: { style: string[], performance: string[], security: string[] } }`

- `GET /api/review/:id`
  - Get review details

### Refactor

- `POST /api/refactor/:id`
  - Generate refactored code for a submission
  - Returns: `{ original: string, refactored: string, improvements: string[] }`

- `GET /api/refactor/:id`
  - Get refactor details

## Features

### AI Models
- OpenAI GPT-4 (default)
  - Latest GPT-4 model optimized for code
  - High-quality analysis and refactoring
  - JSON response format
- Meta Llama (CodeLlama-34b)
  - Specialized code model
  - Available as an alternative option
  - Robust JSON parsing with fallback

### Model Selection
- Configure via environment variable `AI_MODEL`
- Runtime model switching support
- Automatic fallback to OpenAI if Llama is unavailable
- Configurable model parameters:
  - Temperature (`AI_TEMPERATURE`)
  - Max tokens (`AI_MAX_TOKENS`)
  - Top P (`AI_TOP_P`)

### Caching
- Redis is used to cache code analysis and refactoring results
- Cache TTL: 24 hours for both analysis and refactoring
- Cache keys are generated using base64-encoded code content

### Rate Limiting
- Global rate limit: 100 requests per 15 minutes
- Rate limit headers are included in responses
- Exceeded requests return 429 status code

### AI Integration
- Detailed prompts for comprehensive feedback
- Temperature settings optimized for code-related tasks
- JSON response format for structured data
- Robust error handling and response parsing

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run tests (when implemented) 