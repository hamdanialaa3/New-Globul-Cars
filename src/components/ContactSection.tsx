import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

import { CarListing } from '../types/CarListing';

interface ContactSectionProps {
  car: CarListing;
}

export function ContactSection({ car }: ContactSectionProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      // TODO: Implement messaging logic
      console.log('Sending message:', message, 'for car:', car.id);
      alert('Message sent successfully!');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Extract seller info from car object
  const sellerName = car.sellerName || 'Seller';
  const sellerPhone = car.sellerPhone || '+359 XXX XXX XXX';
  const sellerEmail = car.sellerEmail || 'contact@example.com';
  const sellerLocation = car.city || car.location || 'Bulgaria';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Seller</h2>
      
      {/* Seller Information */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Phone</div>
            <a 
              href={`tel:${sellerPhone}`} 
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              {sellerPhone}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-700">
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <a 
              href={`mailto:${sellerEmail}`} 
              className="font-medium text-green-600 hover:text-green-700"
            >
              {sellerEmail}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-700">
          <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Location</div>
            <span className="font-medium">{sellerLocation}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a
          href={`tel:${sellerPhone}`}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Phone className="h-4 w-4" />
          <span className="font-medium">Call</span>
        </a>
        
        <a
          href={`mailto:${sellerEmail}`}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Mail className="h-4 w-4" />
          <span className="font-medium">Email</span>
        </a>
      </div>

      {/* Message Form */}
      <div className="border-t pt-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="h-4 w-4" />
          Send a Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi, I'm interested in this car..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
          className="w-full mt-3 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      {/* Seller Info */}
      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-sm text-gray-600">
          Listed by <span className="font-semibold text-gray-900">{sellerName}</span>
        </p>
      </div>
    </div>
  );
}
