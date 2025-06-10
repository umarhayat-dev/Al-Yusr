import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ref, push, onValue, off, serverTimestamp } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher' | 'admin';
  timestamp: number;
  conversationId: string;
}

interface Conversation {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

interface ChatSystemProps {
  mode: 'student' | 'teacher' | 'admin';
}

export default function ChatSystem({ mode }: ChatSystemProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations based on user role
  useEffect(() => {
    if (!user) return;

    const conversationsRef = ref(rtdb, 'conversations');
    
    const unsubscribe = onValue(conversationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const conversationList = Object.entries(data).map(([id, conv]: [string, any]) => ({
          id,
          ...conv
        }));

        // Filter conversations based on user role
        let filteredConversations = conversationList;
        if (mode === 'student') {
          filteredConversations = conversationList.filter(conv => conv.studentId === user.uid);
        } else if (mode === 'teacher') {
          filteredConversations = conversationList.filter(conv => conv.teacherId === user.uid);
        }
        // Admin sees all conversations

        setConversations(filteredConversations);
      } else {
        setConversations([]);
      }
      setLoading(false);
    });

    return () => off(conversationsRef, 'value', unsubscribe);
  }, [user, mode]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const messagesRef = ref(rtdb, `messages/${activeConversation}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([id, msg]: [string, any]) => ({
          id,
          ...msg
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messageList);
      } else {
        setMessages([]);
      }
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }, [activeConversation]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    const messageData = {
      text: newMessage.trim(),
      senderId: user.uid,
      senderName: user.displayName || user.email?.split('@')[0] || 'User',
      senderRole: user.role || mode,
      timestamp: serverTimestamp(),
      conversationId: activeConversation
    };

    try {
      // Add message to messages
      await push(ref(rtdb, `messages/${activeConversation}`), messageData);
      
      // Update conversation last message
      const conversationRef = ref(rtdb, `conversations/${activeConversation}`);
      await push(conversationRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2">Loading conversations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    activeConversation === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setActiveConversation(conversation.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {mode === 'admin' 
                          ? conversation.studentName.slice(0, 2).toUpperCase()
                          : mode === 'student' 
                          ? conversation.teacherName.slice(0, 2).toUpperCase()
                          : conversation.studentName.slice(0, 2).toUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {mode === 'admin' 
                            ? `${conversation.studentName} ↔ ${conversation.teacherName}`
                            : mode === 'student' 
                            ? conversation.teacherName
                            : conversation.studentName
                          }
                        </h4>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {activeConversation ? 'Chat Messages' : 'Select a conversation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!activeConversation ? (
            <div className="flex items-center justify-center h-[450px] text-muted-foreground">
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              <ScrollArea className="h-[400px] p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${
                        message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === user?.uid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.senderName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.senderRole}
                          </Badge>
                        </div>
                        <p className="text-sm">{message.text}</p>
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Message Input */}
              {mode !== 'admin' && (
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}