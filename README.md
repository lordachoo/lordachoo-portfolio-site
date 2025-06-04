# Software Engineer Portfolio Website Builder

A full-stack personal portfolio website for software engineers featuring secure authentication, PostgreSQL database storage, and a comprehensive admin content management system with customizable themes.

## Features

### Public Website
- **Responsive Design**: Modern, professional layout with dark/light theme toggle (dark mode default)
- **Smooth Navigation**: Left sidebar navigation with smooth scrolling to sections
- **Hero Section**: Customizable introduction with name, title, and description
- **Resume Section**: Dynamic experience, education, and skills display
- **Projects Showcase**: Featured projects with GitHub integration support
- **Blog Section**: Clean blog post display with read time estimates
- **Contact Form**: PostgreSQL-stored contact messages with admin management
- **External Links**: Navigation supports external URLs that open in new tabs

### Admin Panel
- **Secure Authentication**: Cookie-based session authentication (admin/admin123)
- **Content Management**: Full CRUD operations for all website content
- **Navigation Editor**: Drag-and-drop reordering with visibility controls
- **Dynamic Content**: Edit hero section, blog posts, projects, resume data
- **Contact Messages**: View, manage, and respond to contact form submissions
- **Password Management**: Secure admin password changing functionality
- **Real-time Updates**: Changes reflect immediately on public site
- **Role-based Access**: Protected admin routes with proper authorization

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for state management and caching
- **Wouter** for client-side routing
- **@dnd-kit** for drag-and-drop functionality
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Cookie-based sessions** for authentication
- **Zod** for validation

### Database
- **PostgreSQL** with comprehensive schema
- **Drizzle migrations** for schema management
- **Relational data modeling** with proper foreign keys

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── admin/      # Admin panel components
│   │   │   ├── sections/   # Website section components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and API client
│   │   └── pages/          # Page components
│   └── index.html
├── server/                 # Express backend
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── README.md
```

## Database Schema

### Core Tables
- **users**: User authentication and profile data
- **sessions**: Session storage for authentication
- **admin_users**: Admin user accounts
- **admin_sessions**: Admin session management

### Content Tables
- **navigation_items**: Dynamic navigation with ordering and visibility
- **content_sections**: Flexible content sections (hero, about, etc.)
- **blog_posts**: Blog entries with metadata and content
- **projects**: Project showcase with links and descriptions
- **experiences**: Work experience entries
- **education**: Education history
- **skill_categories**: Skill organization
- **skills**: Individual skills with proficiency levels
- **profile**: Global profile settings
- **contact_messages**: Contact form submissions with read status

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn package manager

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/lordachoo/lordachoo-portfolio-site
cd portfolio-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**
```bash
# Create a new PostgreSQL database
createdb portfolio_db
```

4. **Configure environment variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/portfolio_db
SESSION_SECRET=your-random-session-secret-here
NODE_ENV=development
```

5. **Run database migrations**
```bash
npm run db:push
```

6. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Deployment

#### Option 1: Traditional VPS/Server

1. **Server Requirements**
   - Ubuntu 20.04+ or similar Linux distribution
   - Node.js 18+
   - PostgreSQL 14+
   - Nginx (recommended)
   - SSL certificate (Let's Encrypt recommended)

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PostgreSQL**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

4. **Create database and user**
```bash
sudo -u postgres psql
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
\q
```

5. **Clone and setup application**
```bash
git clone <repository-url> /var/www/portfolio
cd /var/www/portfolio
npm install
npm run build
```

6. **Configure environment variables**
```bash
sudo nano /var/www/portfolio/.env
```
```env
DATABASE_URL=postgresql://portfolio_user:secure_password@localhost:5432/portfolio_db
SESSION_SECRET=your-very-secure-random-session-secret
NODE_ENV=production
PORT=3000
```

7. **Run database migrations**
```bash
npm run db:push
```

8. **Create systemd service**
```bash
sudo nano /etc/systemd/system/portfolio.service
```
```ini
[Unit]
Description=Portfolio Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/portfolio
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

9. **Start and enable service**
```bash
sudo systemctl daemon-reload
sudo systemctl start portfolio
sudo systemctl enable portfolio
```

10. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/portfolio
```
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

11. **Enable site and restart Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

12. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### Option 2: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "server/index.js"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://portfolio:password@db:5432/portfolio
      - SESSION_SECRET=your-session-secret
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=portfolio
      - POSTGRES_USER=portfolio
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

3. **Deploy with Docker**
```bash
docker-compose up -d
docker-compose exec app npm run db:push
```

#### Option 3: Replit Deployment

1. **Fork the Replit project**
2. **Configure Secrets in Replit**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Random secure string

3. **Run database setup**
```bash
npm run db:push
```

4. **Deploy using Replit's deployment feature**

## Configuration

### Default Admin Account
- **Username**: admin
- **Password**: admin123

**Important**: Change the default admin credentials immediately in production!

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `SESSION_SECRET` | Secret for session encryption | Yes | - |
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 5000 |

### Database Commands

```bash
# Push schema changes to database
npm run db:push

# Generate new migration
npm run db:generate

# View database in Drizzle Studio
npm run db:studio
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current admin user

### Public Content
- `GET /api/profile` - Get profile information
- `GET /api/navigation` - Get navigation items (visible only)
- `GET /api/content/:section` - Get content section
- `GET /api/blog` - Get published blog posts
- `GET /api/projects` - Get projects
- `GET /api/experience` - Get work experience
- `GET /api/education` - Get education history
- `GET /api/skills` - Get skills with categories
- `POST /api/contact` - Submit contact form message

### Admin Content (Protected)
- `GET /api/navigation?admin=true` - Get all navigation items (including hidden)
- `POST /api/navigation` - Create navigation item
- `PUT /api/navigation/:id` - Update navigation item
- `DELETE /api/navigation/:id` - Delete navigation item
- `GET /api/contact/messages` - Get all contact messages
- `PUT /api/contact/messages/:id/read` - Mark message as read
- `DELETE /api/contact/messages/:id` - Delete contact message
- `POST /api/auth/change-password` - Change admin password
- Similar CRUD endpoints for all content types

## Security Features

- **Cookie-based Authentication**: Secure session management
- **CSRF Protection**: Built-in request validation
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Protection**: React's built-in XSS protection
- **Secure Headers**: Express security middleware

## Performance Optimizations

- **React Query Caching**: Intelligent data caching and invalidation
- **Code Splitting**: Automatic route-based code splitting
- **Asset Optimization**: Vite's built-in asset optimization
- **Database Indexing**: Proper database indexes for performance
- **Gzip Compression**: Server-side compression

## Customization

### Themes
- Edit `client/src/index.css` for custom color schemes
- Modify Tailwind configuration in `tailwind.config.ts`
- Use CSS variables for consistent theming

### Content Sections
- Add new content types in `shared/schema.ts`
- Create corresponding UI components
- Update storage interface and API routes

### Navigation
- Supports both internal section links (#section) and external URLs
- Drag-and-drop reordering in admin panel
- Visibility controls for each navigation item

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists and user has permissions

2. **Authentication Issues**
   - Clear browser cookies
   - Verify SESSION_SECRET is set
   - Check admin credentials

3. **Build Errors**
   - Run `npm install` to ensure all dependencies
   - Check Node.js version (18+ required)
   - Verify TypeScript compilation

### Logs and Debugging

- Development logs: Console output during `npm run dev`
- Production logs: Check systemd logs with `sudo journalctl -u portfolio`
- Database logs: PostgreSQL logs typically in `/var/log/postgresql/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and support:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Ensure all environment variables are correctly set
4. Verify database connectivity and schema is up to date

---

**Security Note**: Always change default credentials and use strong passwords in production environments. Regularly update dependencies and monitor for security vulnerabilities.