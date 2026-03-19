#!/bin/bash
# Setup script for Ajax in Plain Sight
# Run this after initial deployment to configure everything

set -e

echo "🚀 Ajax in Plain Sight - Setup Script"
echo "======================================"
echo ""

# Check for required tools
echo "✓ Checking for required tools..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+"
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm not found. Please install pnpm"
  exit 1
fi

echo "✓ Node.js and pnpm found"
echo ""

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
pnpm install
echo "✓ Dependencies installed"
echo ""

# Step 2: Set up environment variables
echo "Step 2: Environment Variables"
echo "------------------------------"

if [ ! -f .env.local ]; then
  echo "ℹ️  .env.local not found"
  echo ""
  echo "You need to create .env.local with your credentials:"
  echo ""
  echo "Required environment variables:"
  echo "  - POSTGRES_PRISMA_URL (from Supabase)"
  echo "  - POSTGRES_URL_NON_POOLING (from Supabase)"
  echo "  - NEXT_PUBLIC_SUPABASE_URL (from Supabase)"
  echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase)"
  echo "  - SUPABASE_SERVICE_ROLE_KEY (from Supabase)"
  echo "  - ANTHROPIC_API_KEY (from https://console.anthropic.com)"
  echo "  - ISR_REVALIDATION_TOKEN (generate with: openssl rand -hex 32)"
  echo ""
  echo "Copy .env.local.example to .env.local and fill in your values"
  exit 1
else
  echo "✓ .env.local exists"
fi
echo ""

# Step 3: Set up database
echo "Step 3: Setting up database..."
echo "This requires POSTGRES_URL_NON_POOLING to be set in .env.local"
echo ""

if [ -z "$POSTGRES_URL_NON_POOLING" ]; then
  echo "⚠️  POSTGRES_URL_NON_POOLING not set in environment"
  echo "Make sure to set it in .env.local or as an environment variable"
else
  echo "✓ Database URL found"
  
  # Check if we can connect
  if pnpm exec prisma db push --skip-generate; then
    echo "✓ Database schema created"
  else
    echo "⚠️  Database schema may already exist"
  fi
fi
echo ""

# Step 4: Generate Prisma client
echo "Step 4: Generating Prisma client..."
pnpm exec prisma generate
echo "✓ Prisma client generated"
echo ""

# Step 5: Seed initial data
echo "Step 5: Seeding initial councillor data..."
echo "This requires database access"
echo ""

read -p "Do you want to seed the database with councillor data now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  cd scripts
  if ! command -v uv &> /dev/null; then
    echo "Installing uv..."
    pip install uv
  fi
  
  echo "Running seed script..."
  uv run seed_councillors.py
  echo "✓ Councillors seeded"
  cd ..
else
  echo "⏭️  Skipping seed. You can run it later with: cd scripts && uv run seed_councillors.py"
fi
echo ""

# Step 6: Build Next.js
echo "Step 6: Building Next.js..."
pnpm build
echo "✓ Build successful"
echo ""

# Setup complete
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: pnpm dev"
echo "2. Open http://localhost:3000"
echo "3. Set up GitHub Actions secrets (see DEPLOYMENT.md)"
echo "4. Deploy to Vercel with: vercel deploy"
echo ""
echo "For more info, see:"
echo "  - README.md - Project overview"
echo "  - DEPLOYMENT.md - Deployment & automation setup"
echo ""
