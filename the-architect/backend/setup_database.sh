#!/bin/bash

# DevBrain Backend Database Setup Script
echo "🚀 Setting up DevBrain Backend Database..."

# Navigate to backend directory
cd backend

# Activate virtual environment (if not already active)
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  Please activate your virtual environment first:"
    echo "   source venv/bin/activate"
    exit 1
fi

echo "📝 Creating migrations..."
python manage.py makemigrations api

echo "🔄 Applying migrations..."
python manage.py migrate

echo "👤 Creating default user..."
python manage.py create_default_user

echo "✅ Database setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the backend server: python manage.py runserver 0.0.0.0:8000"
echo "2. Start the frontend server: cd ../frontend && npm run dev"
echo "3. Open http://localhost:5173 to test the integration"