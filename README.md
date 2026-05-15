# Saswat Kumar Rout - Advocate Portfolio & Legal Platform

A professional portfolio and blogging platform built for Advocate Saswat Kumar Rout. This website serves as a digital presence to showcase legal expertise, publish insightful legal articles, and manage content seamlessly.

## Features

- **Professional Portfolio (Home):** A clean and responsive landing page to present practice areas, experience, and contact information.
- **Legal Blog:** A dedicated blog section to publish articles, case studies, and legal updates for clients.
- **Admin Dashboard:** A secure, authenticated admin interface to manage and publish blog posts.
- **Responsive Design:** Fully responsive and optimized for both mobile and desktop users.

## Tech Stack

This project is built using modern web technologies:

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Framer Motion (for animations)
- **Routing:** React Router DOM
- **Backend/Database:** Firebase (Firestore)
- **Content Rendering:** React Markdown

## Running the Project Locally

To run this project on your local machine, follow these steps:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/vabyashamohapatra-source/skr-legal-platform.git
   cd skr-legal-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy the `.env.example` file and rename it to `.env.local`
   - Fill in your Firebase configuration keys and any other necessary environment variables.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the localhost URL provided in your terminal (usually `http://localhost:3000` or `http://localhost:5173`).

## Project Structure

- `src/pages/` - Contains the main route components (`Home`, `Blog`, `BlogPost`, `Admin`).
- `src/components/` - Reusable UI components like the Navbar.
- `src/firebase.ts` - Firebase configuration and initialization.

## License

This project is proprietary and intended for the specific client use case.
