#!/usr/bin/env python3
"""
Globul Cars - n8n Webhooks Automated Testing Script (Python)

Tests all 21 webhook endpoints automatically
Run: python test-all-webhooks.py
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple

BASE_URL = 'https://globul-cars-bg.app.n8n.cloud/webhook'

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'

def log_success(msg: str):
    print(f"{Colors.GREEN}✓{Colors.RESET} {msg}")

def log_error(msg: str):
    print(f"{Colors.RED}✗{Colors.RESET} {msg}")

def log_info(msg: str):
    print(f"{Colors.BLUE}ℹ{Colors.RESET} {msg}")

def log_warn(msg: str):
    print(f"{Colors.YELLOW}⚠{Colors.RESET} {msg}")

def log_section(msg: str):
    print(f"\n{Colors.CYAN}▶{Colors.RESET} {msg}")

def get_timestamp() -> str:
    return datetime.utcnow().isoformat() + 'Z'

def get_unique_id(prefix: str = 'test') -> str:
    return f"{prefix}-{int(time.time() * 1000)}"

# Test data for all endpoints
WEBHOOK_TESTS = [
    # Workflow 1: Sell Process Started
    {
        'workflow': 'Sell Process',
        'endpoint': '/sell-started',
        'body': {
            'userId': get_unique_id('user'),
            'timestamp': get_timestamp(),
            'source': 'automated_test_python',
            'userProfile': {
                'displayName': 'Python Test User',
                'email': 'test@globul.net',
                'language': 'bg'
            }
        }
    },

    # Workflow 2: Vehicle Type Selected
    {
        'workflow': 'Vehicle Type',
        'endpoint': '/vehicle-type-selected',
        'body': {
            'userId': get_unique_id('user'),
            'vehicleType': 'car',
            'timestamp': get_timestamp(),
            'sessionId': get_unique_id('session')
        }
    },

    # Workflow 3: Complete Sell Workflow
    {
        'workflow': 'Complete Sell',
        'endpoint': '/seller-type-selected',
        'body': {
            'userId': get_unique_id('user'),
            'sellerType': 'private',
            'timestamp': get_timestamp(),
            'sessionId': get_unique_id('session')
        }
    },
    {
        'workflow': 'Complete Sell',
        'endpoint': '/vehicle-data-entered',
        'body': {
            'userId': get_unique_id('user'),
            'sessionId': get_unique_id('session'),
            'vehicleData': {
                'make': 'BMW',
                'model': 'X5',
                'year': 2020,
                'mileage': 45000,
                'fuelType': 'diesel',
                'transmission': 'automatic'
            },
            'timestamp': get_timestamp()
        }
    },
    {
        'workflow': 'Complete Sell',
        'endpoint': '/equipment-selected',
        'body': {
            'userId': get_unique_id('user'),
            'sessionId': get_unique_id('session'),
            'equipment': ['air_conditioning', 'navigation', 'leather_seats'],
            'timestamp': get_timestamp()
        }
    },
    {
        'workflow': 'Complete Sell',
        'endpoint': '/images-uploaded',
        'body': {
            'userId': get_unique_id('user'),
            'sessionId': get_unique_id('session'),
            'images': [
                {'url': 'https://example.com/car1.jpg', 'type': 'exterior', 'order': 1},
                {'url': 'https://example.com/car2.jpg', 'type': 'interior', 'order': 2}
            ],
            'totalImages': 2,
            'timestamp': get_timestamp()
        }
    },
    {
        'workflow': 'Complete Sell',
        'endpoint': '/price-set',
        'body': {
            'userId': get_unique_id('user'),
            'sessionId': get_unique_id('session'),
            'price': 35000,
            'currency': 'EUR',
            'negotiable': True,
            'timestamp': get_timestamp()
        }
    },
    {
        'workflow': 'Complete Sell',
        'endpoint': '/contact-info-entered',
        'body': {
            'userId': get_unique_id('user'),
            'sessionId': get_unique_id('session'),
            'contactInfo': {
                'name': 'Python Test',
                'phone': '+359888123456',
                'email': 'test@globul.net',
                'preferredContact': 'phone'
            },
            'timestamp': get_timestamp()
        }
    },
    {
        'workflow': 'Complete Sell',
        'endpoint': '/listing-published',
        'body': {
            'userId': get_unique_id('user'),
            'sessionId': get_unique_id('session'),
            'listingId': get_unique_id('listing'),
            'status': 'published',
            'publishedAt': get_timestamp()
        }
    },

    # Workflow 4: User Tracking
    {
        'workflow': 'User Tracking',
        'endpoint': '/user-registered',
        'body': {
            'userId': get_unique_id('user'),
            'email': 'test@globul.net',
            'displayName': 'Python Test User',
            'registrationMethod': 'email',
            'timestamp': get_timestamp()
        }
    },
    {
        'workflow': 'User Tracking',
        'endpoint': '/user-logged-in',
        'body': {
            'userId': get_unique_id('user'),
            'timestamp': get_timestamp(),
            'loginMethod': 'email',
            'deviceInfo': {
                'type': 'desktop',
                'os': 'Windows',
                'browser': 'Python Script'
            }
        }
    },
    {
        'workflow': 'User Tracking',
        'endpoint': '/profile-updated',
        'body': {
            'userId': get_unique_id('user'),
            'timestamp': get_timestamp(),
            'updatedFields': ['phone', 'location']
        }
    },
    {
        'workflow': 'User Tracking',
        'endpoint': '/listing-created',
        'body': {
            'userId': get_unique_id('user'),
            'listingId': get_unique_id('listing'),
            'vehicleType': 'car',
            'make': 'BMW',
            'model': 'X5',
            'year': 2020,
            'price': 35000,
            'timestamp': get_timestamp()
        }
    },

    # Workflow 5: User Engagement
    {
        'workflow': 'User Engagement',
        'endpoint': '/car-viewed',
        'body': {
            'userId': get_unique_id('user'),
            'carId': get_unique_id('car'),
            'timestamp': get_timestamp(),
            'viewDuration': 45,
            'source': 'search_results'
        }
    },
    {
        'workflow': 'User Engagement',
        'endpoint': '/favorite-added',
        'body': {
            'userId': get_unique_id('user'),
            'carId': get_unique_id('car'),
            'timestamp': get_timestamp(),
            'source': 'listing_page'
        }
    },
    {
        'workflow': 'User Engagement',
        'endpoint': '/message-sent',
        'body': {
            'event': 'message_sent',
            'messageId': get_unique_id('msg'),
            'chatId': get_unique_id('chat'),
            'carId': get_unique_id('car'),
            'senderId': get_unique_id('user'),
            'receiverId': get_unique_id('seller'),
            'text': 'Test message from Python script',
            'language': 'en',
            'timestamp': get_timestamp()
        }
    },
    {
        'workflow': 'User Engagement',
        'endpoint': '/search-performed',
        'body': {
            'userId': get_unique_id('user'),
            'timestamp': get_timestamp(),
            'searchQuery': {
                'make': 'BMW',
                'yearFrom': 2018,
                'yearTo': 2023
            },
            'resultsCount': 15
        }
    },

    # Workflow 6: Admin & BI
    {
        'workflow': 'Admin & BI',
        'endpoint': '/admin-login',
        'body': {
            'action': 'admin_login',
            'adminId': 'admin-test',
            'timestamp': get_timestamp(),
            'data': {
                'isNewLocation': False,
                'isNewDevice': False,
                'multipleFailedAttempts': False
            }
        }
    },
    {
        'workflow': 'Admin & BI',
        'endpoint': '/admin-action',
        'body': {
            'action': 'admin_action',
            'adminId': 'admin-test',
            'timestamp': get_timestamp(),
            'data': {
                'operation': 'view_dashboard',
                'targetId': 'dashboard-main'
            }
        }
    },
    {
        'workflow': 'Admin & BI',
        'endpoint': '/analytics-viewed',
        'body': {
            'action': 'analytics_viewed',
            'adminId': 'admin-test',
            'timestamp': get_timestamp(),
            'data': {
                'view': 'sales_dashboard',
                'filters': {'period': '7d'}
            }
        }
    },
    {
        'workflow': 'Admin & BI',
        'endpoint': '/system-alert',
        'body': {
            'action': 'system_alert',
            'adminId': 'admin-test',
            'timestamp': get_timestamp(),
            'data': {
                'severity': 'low',
                'alertType': 'test_alert',
                'message': 'Automated test from Python'
            }
        }
    }
]

def test_webhook(test: Dict) -> Tuple[bool, int, str]:
    """Test a single webhook endpoint"""
    url = BASE_URL + test['endpoint']
    
    try:
        response = requests.post(
            url,
            json=test['body'],
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        status = response.status_code
        success = 200 <= status < 300
        
        if success:
            log_success(f"[{test['workflow']}] {test['endpoint']} → {status}")
        else:
            log_error(f"[{test['workflow']}] {test['endpoint']} → {status}")
            log_warn(f"   Response: {response.text[:100]}")
        
        return success, status, response.text
        
    except Exception as e:
        log_error(f"[{test['workflow']}] {test['endpoint']} → FAILED")
        log_warn(f"   Error: {str(e)}")
        return False, 0, str(e)

def run_all_tests():
    """Run all webhook tests"""
    print('\n╔═══════════════════════════════════════════════════════╗')
    print('║  Globul Cars - n8n Webhooks Automated Test Suite     ║')
    print('╚═══════════════════════════════════════════════════════╝\n')
    
    log_info(f"Testing {len(WEBHOOK_TESTS)} endpoints...")
    log_info(f"Base URL: {BASE_URL}\n")
    
    results = []
    current_workflow = ''
    
    for test in WEBHOOK_TESTS:
        if test['workflow'] != current_workflow:
            log_section(f"Testing {test['workflow']}")
            current_workflow = test['workflow']
        
        success, status, response = test_webhook(test)
        results.append({
            'test': test,
            'success': success,
            'status': status,
            'response': response
        })
        
        # Small delay between requests
        time.sleep(0.5)
    
    # Summary
    print('\n╔═══════════════════════════════════════════════════════╗')
    print('║  Test Summary                                         ║')
    print('╚═══════════════════════════════════════════════════════╝\n')
    
    successful = sum(1 for r in results if r['success'])
    failed = len(results) - successful
    total = len(results)
    success_rate = (successful / total * 100) if total > 0 else 0
    
    log_info(f"Total Tests: {total}")
    log_success(f"Successful: {successful}")
    if failed > 0:
        log_error(f"Failed: {failed}")
    log_info(f"Success Rate: {success_rate:.1f}%")
    
    if failed > 0:
        print(f"\n{Colors.YELLOW}Failed Endpoints:{Colors.RESET}")
        for r in results:
            if not r['success']:
                endpoint = r['test']['endpoint']
                status = r['status'] or 'Network Error'
                print(f"  - {endpoint} ({status})")
    
    print(f"\n{Colors.CYAN}Next Steps:{Colors.RESET}")
    print("  1. Check n8n Executions: https://globul-cars-bg.app.n8n.cloud")
    print("  2. Verify workflows are Active")
    print("  3. Review any failed endpoints above\n")
    
    return 0 if failed == 0 else 1

if __name__ == '__main__':
    try:
        exit_code = run_all_tests()
        exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}")
        exit(1)
    except Exception as e:
        log_error(f"Fatal error: {str(e)}")
        exit(1)
