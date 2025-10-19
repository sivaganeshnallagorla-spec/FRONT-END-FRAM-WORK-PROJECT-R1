import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    role: string;
  };
  receiver: {
    id: string;
    full_name: string;
    role: string;
  };
}

export default function Messages() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          is_read,
          created_at,
          sender:sender_id (id, full_name, role),
          receiver:receiver_id (id, full_name, role)
        `)
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data as any || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">{t('loading')}</div>;

  const sentMessages = messages.filter(m => (m.sender as any)?.id === user?.id);
  const receivedMessages = messages.filter(m => (m.receiver as any)?.id === user?.id);
  const unreadCount = receivedMessages.filter(m => !m.is_read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('nav.messages')}</h1>
        {unreadCount > 0 && (
          <p className="text-gray-600">
            You have <span className="font-semibold text-green-600">{unreadCount}</span> unread message{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Received Messages</h2>
          {receivedMessages.length === 0 ? (
            <p className="text-gray-600 text-sm">No messages received yet.</p>
          ) : (
            <div className="space-y-3">
              {receivedMessages.map(message => (
                <MessageCard key={message.id} message={message} type="received" />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sent Messages</h2>
          {sentMessages.length === 0 ? (
            <p className="text-gray-600 text-sm">No messages sent yet.</p>
          ) : (
            <div className="space-y-3">
              {sentMessages.map(message => (
                <MessageCard key={message.id} message={message} type="sent" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageCard({ message, type }: { message: Message; type: 'sent' | 'received' }) {
  const otherUser = type === 'received' ? message.sender : message.receiver;

  return (
    <div className={`border rounded-lg p-4 ${!message.is_read && type === 'received' ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-900">
            {type === 'received' ? 'From' : 'To'}: {(otherUser as any)?.full_name || 'User'}
          </p>
          <p className="text-xs text-gray-600">
            {(otherUser as any)?.role && `(${(otherUser as any).role})`}
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(message.created_at).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      <p className="text-sm text-gray-700">{message.content}</p>
      {!message.is_read && type === 'received' && (
        <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Unread
        </span>
      )}
    </div>
  );
}
