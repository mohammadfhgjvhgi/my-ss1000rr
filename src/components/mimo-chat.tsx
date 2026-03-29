'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Send, Bot, User, Trash2, Pin, MessageSquare,
  Sparkles, Clock, ChevronRight, Loader2, CheckCircle,
  AlertCircle, Database, Brain, Menu, X, Zap, Trophy
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { useStore } from '@/lib/store';
import type { AIAgentMessage, AIConversationSession, MoodEntry, AICommand } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ============================================
// ⚔️ MiMo Command Engine Interface
// ============================================

const MiMoAIView = () => {
  const {
    aiConversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    addMessageToConversation,
    deleteConversation,
    pinConversation,
    updateConversationTitle,
    userProfile,
    addExperience,
    addDailyRecord,
    dailyRecords,
    moodEntries,
    addMoodEntry,
    addXP,
    performance,
    hardMode,
    toggleHardMode,
    executeCommand
  } = useStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current conversation
  const currentConversation = aiConversations.find(c => c.id === currentConversationId);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  // Create new conversation if none exists
  useEffect(() => {
    if (aiConversations.length === 0) {
      createConversation('general');
    }
  }, [aiConversations.length, createConversation]);

  // Handle sending message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const userMessage: AIAgentMessage = {
      id: generateId(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    let conversationId = currentConversationId;
    
    // Create new conversation if none selected
    if (!conversationId) {
      conversationId = createConversation('general');
    }

    addMessageToConversation(conversationId, userMessage);

    try {
      // Get all messages for context
      const conversation = useStore.getState().aiConversations.find(c => c.id === conversationId);
      const messages = conversation?.messages.map(m => ({
        role: m.role,
        content: m.content
      })) || [];

      // Add current message
      messages.push({ role: 'user', content: messageContent });

      // Call MiMo API
      const response = await fetch('/api/mimo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          userProfile,
          context: conversation?.context || 'general'
        })
      });

      const data = await response.json();

      // Add assistant message
      const assistantMessage: AIAgentMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.message || 'عذراً، حدث خطأ في الاستجابة.',
        timestamp: new Date()
      };

      addMessageToConversation(conversationId, assistantMessage);

      // Handle commands from AI
      if (data.commands && data.commands.length > 0) {
        handleCommands(data.commands, conversationId);
      }

      // Handle extracted info
      if (data.extractedInfo) {
        handleExtractedInfo(data.extractedInfo, conversationId);
      }

      // Update title if first message
      if (conversation?.messages.length === 0) {
        const title = messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : '');
        updateConversationTitle(conversationId, title);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: AIAgentMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      addMessageToConversation(conversationId!, errorMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle extracted information from AI
  const handleExtractedInfo = (info: { type: string; data: Record<string, unknown> }, conversationId: string) => {
    if (info.type === 'experience') {
      addExperience({
        id: generateId(),
        type: 'skill',
        title: String(info.data.skill || info.data.title || 'خبرة جديدة'),
        description: String(info.data.description || ''),
        category: String(info.data.category || 'other'),
        date: new Date(),
        source: 'ai_extracted',
        relatedConversationId: conversationId,
        tags: [],
        importance: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast.success('💾 تم تسجيل خبرة جديدة!');
    } else if (info.type === 'daily_record') {
      addDailyRecord({
        id: generateId(),
        date: new Date(),
        type: 'progress',
        category: String(info.data.category || 'general'),
        title: String(info.data.subject || info.data.title || 'تقدم يومي'),
        value: Number(info.data.value) || 0,
        unit: String(info.data.unit || ''),
        description: String(info.data.description || ''),
        source: 'ai_recorded',
        relatedConversationId: conversationId,
        createdAt: new Date()
      });
      toast.success('📊 تم تسجيل التقدم!');
    }
  };

  // ⚔️ Handle Commands from AI
  const handleCommands = (commands: AICommand[], conversationId: string) => {
    commands.forEach(cmd => {
      const command: AICommand = {
        id: generateId(),
        type: cmd.type,
        data: cmd.data,
        executed: false,
        timestamp: new Date()
      };
      
      // Execute command
      executeCommand(command);
      
      // Award XP for command execution
      const xpReward = 15;
      const multiplier = hardMode?.enabled ? hardMode.xpMultiplier : 1;
      addXP(Math.round(xpReward * multiplier), `أمر: ${cmd.type}`);
    });
    
    if (commands.length > 0) {
      toast.success(`⚡ تم تنفيذ ${commands.length} أوامر!`);
    }
  };

  // Handle new conversation
  const handleNewChat = () => {
    createConversation('general');
  };

  // Format date for conversation list
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
    }
  };

  // Group conversations by date
  const groupedConversations = React.useMemo(() => {
    const groups: Record<string, AIConversationSession[]> = {
      pinned: [],
      today: [],
      yesterday: [],
      older: []
    };

    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    aiConversations.forEach(conv => {
      const convDate = new Date(conv.createdAt).toDateString();
      
      if (conv.isPinned) {
        groups.pinned.push(conv);
      } else if (convDate === today) {
        groups.today.push(conv);
      } else if (convDate === yesterdayStr) {
        groups.yesterday.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [aiConversations]);

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Sidebar - Conversations List */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-200">
              <Button
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="h-4 w-4 ml-2" />
                محادثة جديدة
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {/* Pinned */}
              {groupedConversations.pinned.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    مثبتة
                  </h4>
                  {groupedConversations.pinned.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === currentConversationId}
                      onSelect={() => setCurrentConversation(conv.id)}
                      onDelete={() => deleteConversation(conv.id)}
                      onPin={() => pinConversation(conv.id, !conv.isPinned)}
                    />
                  ))}
                </div>
              )}

              {/* Today */}
              {groupedConversations.today.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2 px-2">اليوم</h4>
                  {groupedConversations.today.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === currentConversationId}
                      onSelect={() => setCurrentConversation(conv.id)}
                      onDelete={() => deleteConversation(conv.id)}
                      onPin={() => pinConversation(conv.id, !conv.isPinned)}
                    />
                  ))}
                </div>
              )}

              {/* Yesterday */}
              {groupedConversations.yesterday.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2 px-2">أمس</h4>
                  {groupedConversations.yesterday.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === currentConversationId}
                      onSelect={() => setCurrentConversation(conv.id)}
                      onDelete={() => deleteConversation(conv.id)}
                      onPin={() => pinConversation(conv.id, !conv.isPinned)}
                    />
                  ))}
                </div>
              )}

              {/* Older */}
              {groupedConversations.older.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2 px-2">الأسبوع الماضي</h4>
                  {groupedConversations.older.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === currentConversationId}
                      onSelect={() => setCurrentConversation(conv.id)}
                      onDelete={() => deleteConversation(conv.id)}
                      onPin={() => pinConversation(conv.id, !conv.isPinned)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Stats */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{aiConversations.length} محادثة</span>
                <span>{dailyRecords.length} سجل</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                M
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">MiMo</h2>
                <p className="text-xs text-gray-500">مساعدك الذكي الشخصي</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
              <Sparkles className="h-3 w-3" />
              <span>نشط</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={setInput} />
          ) : (
            currentConversation.messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  <span className="text-gray-500 text-sm">يكتب...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            MiMo يسجل تلقائياً المعلومات المهمة من محادثاتك 💾
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📱 Conversation Item Component
// ============================================

const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onPin
}: {
  conversation: AIConversationSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onPin: () => void;
}) => {
  return (
    <div
      className={cn(
        'group p-2 rounded-lg cursor-pointer transition-all mb-1',
        isActive ? 'bg-orange-100 border border-orange-200' : 'hover:bg-gray-100'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {conversation.isPinned && <Pin className="h-3 w-3 text-orange-500" />}
            <p className="font-medium text-gray-900 text-sm truncate">
              {conversation.title}
            </p>
          </div>
          <p className="text-xs text-gray-500 truncate">
            {conversation.messages.length > 0
              ? conversation.messages[conversation.messages.length - 1].content.slice(0, 40) + '...'
              : 'محادثة جديدة'
            }
          </p>
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); onPin(); }}
          >
            <Pin className={cn('h-3 w-3', conversation.isPinned ? 'text-orange-500' : 'text-gray-400')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 💬 Message Bubble Component
// ============================================

const MessageBubble = ({ message }: { message: AIAgentMessage }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-3', isUser ? 'flex-row-reverse' : '')}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser 
          ? 'bg-blue-500 text-white'
          : 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      <div className={cn(
        'max-w-[75%] rounded-2xl px-4 py-3',
        isUser
          ? 'bg-blue-500 text-white rounded-tl-sm'
          : 'bg-gray-100 text-gray-900 rounded-tr-sm'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={cn(
          'text-xs mt-1',
          isUser ? 'text-blue-100' : 'text-gray-400'
        )}>
          {new Date(message.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

// ============================================
// 🌟 Welcome Screen Component
// ============================================

const WelcomeScreen = ({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) => {
  const suggestions = [
    { icon: Brain, text: 'كيف يمكنني تحسين دراستي للتوجيهي؟', color: 'blue' },
    { icon: Database, text: 'سجل: اليوم درست 3 ساعات رياضيات', color: 'green' },
    { icon: Sparkles, text: 'ما هي نصيحتي لمشروع BMS؟', color: 'purple' },
    { icon: CheckCircle, text: 'أنا لدي خبرة في Arduino', color: 'orange' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-4 shadow-lg"
      >
        <Bot className="h-10 w-10 text-white" />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً، أنا MiMo! 👋</h2>
      <p className="text-gray-500 text-center max-w-md mb-6">
        مساعدك الذكي الشخصي. أستطيع محادثتك، تسجيل معلوماتك، والإجابة على أسئلتك.
        <br />
        <span className="text-orange-500 font-medium">جرب كتابة شيء من الاقتراحات!</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border text-right transition-all hover:shadow-md',
              suggestion.color === 'blue' ? 'border-blue-200 hover:bg-blue-50' :
              suggestion.color === 'green' ? 'border-green-200 hover:bg-green-50' :
              suggestion.color === 'purple' ? 'border-purple-200 hover:bg-purple-50' :
              'border-orange-200 hover:bg-orange-50'
            )}
          >
            <suggestion.icon className={cn(
              'h-5 w-5 flex-shrink-0',
              suggestion.color === 'blue' ? 'text-blue-500' :
              suggestion.color === 'green' ? 'text-green-500' :
              suggestion.color === 'purple' ? 'text-purple-500' :
              'text-orange-500'
            )} />
            <span className="text-sm text-gray-700">{suggestion.text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MiMoAIView;
