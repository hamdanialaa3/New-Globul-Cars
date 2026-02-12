#!/bin/bash
# Clean Ports Script for Linux/Mac
# تنظيف المنافذ على Linux/Mac

echo "🔌 تنظيف المنافذ..."

ports=(3000 3001 5173 8080 5000 5001)

for port in "${ports[@]}"; do
    echo "  ⚙️  فحص المنفذ $port..."
    
    pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo "    🛑 إيقاف العملية (PID: $pid) على المنفذ $port"
        kill -9 $pid 2>/dev/null
        echo "  ✅ تم تنظيف المنفذ $port"
    else
        echo "  ℹ️  المنفذ $port غير مستخدم"
    fi
done

echo ""
echo "✨ تم الانتهاء من تنظيف المنافذ!"

