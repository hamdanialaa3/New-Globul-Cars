#!/usr/bin/env python3
"""
Quick script to add vehicle categories translations to translations.ts
"""

import re

# Read the file
file_path = r"bulgarian-car-marketplace\src\locales\translations.ts"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The text to add after smartSell section
new_section = """,
      vehicleCategories: {
        title: 'Категории автомобили',
        subtitle: 'Разгледайте нашата широка гама от автомобили, класифицирани по тип купе за ваше улеснение.',
        smartSearch: 'Интелигентно търсене',
        viewAll: 'Виж всички',
        loading: 'Зареждане на автомобили...'
      }"""

# Find and replace in Bulgarian section
content = content.replace(
    """      smartSell: {
        title: 'Продайте автомобила си бързо',
        description: 'Използвайте нашия интелигентен асистент за оценка и публикуване на обява само за 2 минути.',
        startSelling: 'Започни продажба'
      }
    },""",
    """      smartSell: {
        title: 'Продайте автомобила си бързо',
        description: 'Използвайте нашия интелигентен асистент за оценка и публикуване на обява само за 2 минути.',
        startSelling: 'Започни продажба'
      },
      vehicleCategories: {
        title: 'Категории автомобили',
        subtitle: 'Разгледайте нашата широка гама от автомобили, класифицирани по тип купе за ваше улеснение.',
        smartSearch: 'Интелигентно търсене',
        viewAll: 'Виж всички',
        loading: 'Зареждане на автомобили...'
      }
    },"""
)

# Also add English version
content = content.replace(
    """      smartSell: {
        title: 'Sell Your Car Fast',
        description: 'Use our intelligent assistant to value and post an ad in just 2 minutes.',
        startSelling: 'Start Selling'
      }
    },""",
    """      smartSell: {
        title: 'Sell Your Car Fast',
        description: 'Use our intelligent assistant to value and post an ad in just 2 minutes.',
        startSelling: 'Start Selling'
      },
      vehicleCategories: {
        title: 'Vehicle Categories',
        subtitle: 'Explore our wide range of cars, classified by body type for your convenience.',
        smartSearch: 'Smart Search',
        viewAll: 'View All',
        loading: 'Loading cars...'
      }
    },"""
)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Successfully added vehicle categories translations!")
print("✅ Added to both Bulgarian and English sections")
