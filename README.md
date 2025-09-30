# Claude Config Manager

A modern, project-centric configuration management tool for Claude Desktop and Claude Code. Easily browse, edit, and manage Claude configurations across all your projects from a unified interface.

## Features

### 🎯 Project-Centric Workflow
- **Unified Dashboard**: View all projects with Claude configurations in one place
- **Quick Navigation**: Switch between projects instantly with the project selector
- **Smart Discovery**: Automatically finds `.claude` directories, `CLAUDE.md` files, agents, and MCP servers

### 📝 Configuration Management
- **CLAUDE.md Editor**: Edit project instructions with syntax highlighting
- **Settings Management**: Manage JSON configuration files with validation
- **Agent Support**: View and edit project-level and global agents
- **MCP Server Configuration**: Configure Model Context Protocol servers

### 🔄 Cross-Project Operations
- **Copy Configurations**: Copy settings, agents, or instructions between projects
- **Compare Projects**: Compare configurations side-by-side
- **Batch Updates**: Apply changes across multiple projects

### 🎨 Modern UI/UX
- **Grid & List Views**: Choose your preferred layout
- **Search & Filter**: Quickly find projects by name or features
- **Monaco Editor**: Professional code editing experience
- **Responsive Design**: Works on desktop and tablet screens

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-config-mgr.git
cd claude-config-mgr

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Usage

### Quick Start
1. Launch the application with `npm run dev`
2. The dashboard automatically discovers all projects with Claude configurations
3. Click on any project card to view and edit its configuration
4. Use the search bar to filter projects by name
5. Toggle between grid and list views for your preference

### Managing Configurations
- **Edit CLAUDE.md**: Click on a project, select the Instructions tab, and edit directly
- **Modify Settings**: Navigate to Settings tab to edit JSON configuration files
- **Add Agents**: Create or modify agents in the Agents tab
- **Configure MCP Servers**: Set up Model Context Protocol servers in the MCP tab

### Cross-Project Operations
1. Select a source project
2. Click "Copy To Project" to copy configurations
3. Choose target project and configuration types to copy
4. Confirm to apply changes

## Project Structure

```
claude-config-mgr/
├── app/                    # Next.js app directory
│   ├── api/               # API endpoints
│   └── project-dashboard/ # Main dashboard page
├── components/            # React components
│   ├── project/          # Project-specific components
│   └── ui/               # Reusable UI components
├── stores/               # Zustand state management
└── lib/                  # Utility functions
```

## Configuration Discovery

The application automatically discovers:
- **Global Configuration**: `~/.claude/`
- **Project Configurations**:
  - `.claude/` directories in projects
  - Root-level `CLAUDE.md` files
  - `.mcp.json` files for MCP server configuration
  - Agent directories (`agents/`)

## API Endpoints

- `GET /api/config-files` - List all projects with configurations
- `GET /api/projects/[projectId]` - Get detailed project configuration
- `PUT /api/projects/[projectId]` - Update project configuration
- `GET /api/projects/global` - Get global Claude configuration

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Editor**: Monaco Editor
- **Language**: TypeScript

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.