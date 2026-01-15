"""
Quick Start Guide for Testing NemoRDP Locally
"""

import os
import sys

def check_environment():
    """Check if all required environment variables are set"""
    required_vars = [
        'DATABASE_URL',
        'SECRET_KEY',
        'PAYSTACK_SECRET_KEY',
    ]
    
    optional_vars = [
        'VULTR_API_KEY',
        'CONTABO_API_KEY',
        'SMTP_USER',
        'SMTP_PASSWORD',
    ]
    
    print("🔍 Checking Environment Variables...")
    print("=" * 50)
    
    missing = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing.append(var)
            print(f"❌ {var}: NOT SET")
        else:
            # Mask sensitive values
            display_value = value[:10] + "..." if len(value) > 10 else "***"
            print(f"✅ {var}: {display_value}")
    
    print("\nOptional (for full functionality):")
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            display_value = value[:10] + "..." if len(value) > 10 else "***"
            print(f"✅ {var}: {display_value}")
        else:
            print(f"⚠️  {var}: NOT SET (optional)")
    
    print("=" * 50)
    
    if missing:
        print(f"\n❌ Missing required variables: {', '.join(missing)}")
        print("\n💡 Quick fix:")
        print("   1. Copy .env.example to .env")
        print("   2. Update with your credentials")
        print("   3. Run: source .env (or restart terminal)")
        return False
    
    print("\n✅ All required environment variables are set!")
    return True

def test_database():
    """Test database connection"""
    print("\n🔍 Testing Database Connection...")
    try:
        from backend.database.connection import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\n💡 Make sure PostgreSQL is running:")
        print("   Docker: docker-compose up -d db")
        print("   Local: brew services start postgresql")
        return False

def test_redis():
    """Test Redis connection"""
    print("\n🔍 Testing Redis Connection...")
    try:
        import redis
        from backend.core.celery_app import REDIS_URL
        
        r = redis.from_url(REDIS_URL, socket_connect_timeout=2)
        r.ping()
        print("✅ Redis connection successful!")
        return True
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        print("\n💡 Make sure Redis is running:")
        print("   Docker: docker-compose up -d redis")
        print("   Local: brew services start redis")
        return False

def test_imports():
    """Test if all Python dependencies are installed"""
    print("\n🔍 Testing Python Dependencies...")
    
    dependencies = [
        ('fastapi', 'FastAPI'),
        ('sqlalchemy', 'SQLAlchemy'),
        ('redis', 'Redis'),
        ('celery', 'Celery'),
        ('paystackapi', 'Paystack API'),
        ('httpx', 'HTTPX'),
    ]
    
    all_good = True
    for module, name in dependencies:
        try:
            __import__(module)
            print(f"✅ {name}")
        except ImportError:
            print(f"❌ {name} - NOT INSTALLED")
            all_good = False
    
    if not all_good:
        print("\n💡 Install missing dependencies:")
        print("   cd backend && pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies installed!")
    return True

def main():
    """Run all checks"""
    print("🚀 NemoRDP Local Testing Setup")
    print("=" * 50)
    print()
    
    # Add backend to path
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
    
    checks = [
        ("Environment Variables", check_environment),
        ("Python Dependencies", test_imports),
        ("Database", test_database),
        ("Redis", test_redis),
    ]
    
    results = {}
    for name, check_func in checks:
        try:
            results[name] = check_func()
        except Exception as e:
            print(f"\n❌ {name} check failed with error: {e}")
            results[name] = False
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    
    for name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {name}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 All checks passed! You're ready to start development.")
        print("\n🚀 Next steps:")
        print("   1. Start backend: cd backend && uvicorn main:app --reload")
        print("   2. Start frontend: cd frontend && npm run dev")
        print("   3. Start worker: cd backend && celery -A core.celery_app worker --loglevel=info")
        print("   4. Visit: http://localhost:3000")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above before proceeding.")
        sys.exit(1)

if __name__ == "__main__":
    main()
