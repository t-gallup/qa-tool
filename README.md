# Research Paper Q&A Tool

A React-based tool that helps researchers and students quickly extract key insights from research papers by generating targeted questions and answers.

## Features

- Upload research papers (PDF, TXT, DOC, DOCX)
- AI-powered question and answer generation
- Clean, modern UI with drag-and-drop file upload
- Real-time processing and results display

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Anthropic API key (for Claude integration)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/t-gallup/qa-tool.git
   cd qa-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Anthropic API key:
     ```
     REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
     ```

4. Install required UI components:
   ```bash
   npx shadcn-ui@latest init
   ```
   When prompted, select:
   - Style: Default
   - Base color: Slate
   - CSS variables: Yes
   - React Server Components: No
   - Tailwind CSS: Yes
   - Components location: @/components
   - Customize default imports: No

5. Install specific components:
   ```bash
   npx shadcn-ui@latest add card button input
   ```

6. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

7. Open http://localhost:3000 in your browser

## Project Structure

```
src/
├── components/
│   └── Dropzone.tsx     # File upload component
├── utils/
│   └── openai-helper.ts # AI integration utility
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## Using the Tool

1. Open the application in your browser
2. Drag and drop a research paper file or click to select one
3. Click "Generate Q&A" to process the paper
4. View the generated questions and answers

## Development

- Built with React + TypeScript
- Uses Tailwind CSS for styling
- Integrates with Claude via the Anthropic API
- Components from shadcn/ui library

## Troubleshooting

Common issues and solutions:

1. API Key errors:
   - Ensure your `.env` file is in the root directory
   - Make sure the API key is correctly formatted
   - Restart the development server after adding the key

2. Component errors:
   - Run `npm install` again
   - Ensure all shadcn/ui components are properly installed
   - Check for any missing dependencies in package.json

3. File upload issues:
   - Check if the file format is supported
   - Ensure file size is within reasonable limits
   - Clear browser cache if issues persist