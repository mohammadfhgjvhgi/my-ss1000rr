'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FolderPlus,
  Trash2,
  Edit3,
  Sparkles,
  Upload,
  Mic,
  Image as ImageIcon,
  Wand2,
  Copy,
  Check,
  Undo2,
  Pin,
  Star,
  Search,
  MoreHorizontal,
  X,
  ChevronRight,
  File,
  Loader2,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { useStore } from '@/lib/store';
import type { Note, NoteFolder, EditHistory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// ============================================
// 📝 محرر ماركداون بسيط
// ============================================
const SimpleMarkdownEditor = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const toolbarButtons = [
    { label: 'B', prefix: '**', suffix: '**', title: 'عريض' },
    { label: 'I', prefix: '*', suffix: '*', title: 'مائل' },
    { label: 'S', prefix: '~~', suffix: '~~', title: 'يتوسطه خط' },
    { label: '#', prefix: '# ', suffix: '', title: 'عنوان' },
    { label: '•', prefix: '- ', suffix: '', title: 'قائمة' },
    { label: '1.', prefix: '1. ', suffix: '', title: 'قائمة مرقمة' },
    { label: '>', prefix: '> ', suffix: '', title: 'اقتباس' },
    { label: '`', prefix: '`', suffix: '`', title: 'كود' },
    { label: '[]', prefix: '[', suffix: '](url)', title: 'رابط' },
  ];

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* شريط الأدوات */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => insertMarkdown(btn.prefix, btn.suffix)}
            className="px-2 py-1 text-sm font-mono hover:bg-gray-200 rounded transition-colors"
            title={btn.title}
          >
            {btn.label}
          </button>
        ))}
      </div>
      
      {/* منطقة الكتابة */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-h-[300px] resize-none border-0 focus-visible:ring-0 p-4 text-base leading-relaxed"
        dir="auto"
      />
    </div>
  );
};

// ============================================
// 🔮 لوحة الذكاء الاصطناعي
// ============================================
const AIPanel = ({
  content,
  selectedText,
  onApplyEdit,
  onClose,
}: {
  content: string;
  selectedText: string;
  onApplyEdit: (newContent: string) => void;
  onClose: () => void;
}) => {
  const [action, setAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const actions = [
    { id: 'polish', label: '✨ تحسين', desc: 'تحسين الأسلوب' },
    { id: 'expand', label: '📝 توسيع', desc: 'إضافة تفاصيل' },
    { id: 'condense', label: '📋 اختصار', desc: 'تلخيص النص' },
    { id: 'formal', label: '👔 رسمي', desc: 'أسلوب أكاديمي' },
    { id: 'fix_grammar', label: '✅ تصحيح', desc: 'تصحيح الأخطاء' },
    { id: 'translate', label: '🌐 ترجمة', desc: 'ترجمة للإنجليزية' },
  ];

  const handleAction = async (actionId: string) => {
    setAction(actionId);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText || content,
          action: actionId,
          selectedText,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.editedText);
      } else {
        toast.error('فشل في المعالجة');
      }
    } catch (error) {
      console.error('AI action error:', error);
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          action: 'custom',
          customPrompt,
          selectedText,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.editedText);
      }
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const applyResult = () => {
    if (result) {
      onApplyEdit(result);
      setResult(null);
      setAction(null);
      toast.success('تم تطبيق التعديل');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-80 border-r bg-blue-50/50 flex flex-col"
    >
      <div className="p-4 border-b bg-blue-100/50 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          مساعد الذكاء الاصطناعي
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* إجراءات سريعة */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-gray-600">إجراءات سريعة:</p>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((a) => (
              <Button
                key={a.id}
                variant={action === a.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleAction(a.id)}
                disabled={loading}
                className="justify-start"
              >
                {loading && action === a.id ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <span className="ml-1">{a.label}</span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* أمر مخصص */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-gray-600">أمر مخصص:</p>
          <div className="flex gap-2">
            <Input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="اكتب طلبك..."
              className="flex-1"
            />
            <Button size="icon" onClick={handleCustomPrompt} disabled={loading || !customPrompt.trim()}>
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* النتيجة */}
        {result && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">النتيجة:</p>
            <div className="p-3 bg-white rounded-lg border text-sm whitespace-pre-wrap" dir="auto">
              {result}
            </div>
            <div className="flex gap-2">
              <Button onClick={applyResult} className="flex-1">
                <Check className="h-4 w-4 ml-2" />
                تطبيق
              </Button>
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(result)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};

// ============================================
// 📁 عرض الملاحظات الرئيسي
// ============================================
const NotesView = () => {
  const { notes, folders, currentNoteId, courses, addNote, updateNote, deleteNote, setCurrentNoteId, addFolder, deleteFolder, addEditHistory } = useStore();
  
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // الملاحظة الحالية
  const currentNote = notes.find(n => n.id === currentNoteId);

  // تصفية الملاحظات
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // إنشاء ملاحظة جديدة
  const handleAddNote = () => {
    if (!newNoteTitle.trim()) {
      toast.error('اكتب عنوان الملاحظة');
      return;
    }

    const note: Note = {
      id: generateId(),
      title: newNoteTitle,
      content: '',
      folderId: null,
      tags: [],
      isPinned: false,
      isFavorite: false,
      wordCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addNote(note);
    setCurrentNoteId(note.id);
    setIsAddNoteOpen(false);
    setNewNoteTitle('');
    toast.success('تم إنشاء الملاحظة');
  };

  // إنشاء مجلد جديد
  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('اكتب اسم المجلد');
      return;
    }

    const folder: NoteFolder = {
      id: generateId(),
      name: newFolderName,
      parentId: null,
      order: folders.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addFolder(folder);
    setIsAddFolderOpen(false);
    setNewFolderName('');
    toast.success('تم إنشاء المجلد');
  };

  // تحديث محتوى الملاحظة
  const handleContentChange = useCallback((content: string) => {
    if (!currentNoteId) return;
    
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    updateNote(currentNoteId, { content, wordCount });
  }, [currentNoteId, updateNote]);

  // تطبيق تعديل AI
  const handleApplyEdit = (newContent: string) => {
    if (!currentNote) return;
    
    // حفظ في السجل
    addEditHistory({
      id: generateId(),
      noteId: currentNote.id,
      previousContent: currentNote.content,
      newContent,
      action: 'ai_edit',
      createdAt: new Date(),
    });
    
    updateNote(currentNote.id, { content: newContent });
  };

  // معالجة الصوت
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('generateMinutes', 'true');

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.text) {
        // إنشاء ملاحظة جديدة بالنتيجة
        const note: Note = {
          id: generateId(),
          title: 'محضر اجتماع - ' + new Date().toLocaleDateString('ar-SA'),
          content: data.text + (data.minutes ? '\n\n---\n\n**محضر الاجتماع:**\n' + JSON.stringify(data.minutes, null, 2) : ''),
          folderId: null,
          tags: ['اجتماع'],
          isPinned: false,
          isFavorite: false,
          wordCount: data.text.split(/\s+/).length,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addNote(note);
        setCurrentNoteId(note.id);
        toast.success('تم تحويل الصوت إلى نص');
      } else {
        toast.error('فشل في تحويل الصوت');
      }
    } catch (error) {
      console.error('Audio upload error:', error);
      toast.error('حدث خطأ');
    } finally {
      setIsTranscribing(false);
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    }
  };

  // معالجة الصورة
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const response = await fetch('/api/ai/vision', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.extractedText) {
        // إنشاء ملاحظة جديدة بالنتيجة
        let content = data.extractedText;
        
        if (data.tables && data.tables.length > 0) {
          content += '\n\n**الجداول:**\n' + JSON.stringify(data.tables, null, 2);
        }
        
        if (data.formulas && data.formulas.length > 0) {
          content += '\n\n**الصيغ:**\n' + data.formulas.join('\n');
        }

        const note: Note = {
          id: generateId(),
          title: 'نص مستخرج - ' + new Date().toLocaleDateString('ar-SA'),
          content,
          folderId: null,
          tags: ['OCR'],
          isPinned: false,
          isFavorite: false,
          wordCount: content.split(/\s+/).length,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addNote(note);
        setCurrentNoteId(note.id);
        toast.success('تم استخراج النص من الصورة');
      } else {
        toast.error('فشل في استخراج النص');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('حدث خطأ');
    } finally {
      setIsProcessingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  // تحديد النص المحدد
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] border rounded-xl overflow-hidden bg-white">
      {/* الشريط الجانبي - قائمة الملاحظات */}
      <div className="w-64 border-l bg-gray-50 flex flex-col">
        {/* البحث */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث..."
              className="pr-9"
            />
          </div>
        </div>

        {/* أزرار الإضافة */}
        <div className="p-3 border-b flex gap-2">
          <Button onClick={() => setIsAddNoteOpen(true)} className="flex-1" size="sm">
            <FileText className="h-4 w-4 ml-1" />
            ملاحظة
          </Button>
          <Button onClick={() => setIsAddFolderOpen(true)} variant="outline" size="sm">
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>

        {/* أزرار الرفع */}
        <div className="p-3 border-b flex gap-2">
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => audioInputRef.current?.click()}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4 ml-1" />
            )}
            صوت
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => imageInputRef.current?.click()}
            disabled={isProcessingImage}
          >
            {isProcessingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4 ml-1" />
            )}
            صورة
          </Button>
        </div>

        {/* قائمة الملاحظات */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">لا توجد ملاحظات</p>
                <p className="text-xs">اضغط "ملاحظة" للبدء</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setCurrentNoteId(note.id)}
                  className={cn(
                    "w-full text-right p-3 rounded-lg transition-colors",
                    currentNoteId === note.id
                      ? "bg-blue-100 border-blue-300 border"
                      : "hover:bg-gray-100 border border-transparent"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{note.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {note.wordCount} كلمة
                      </p>
                    </div>
                    {note.isPinned && <Pin className="h-3 w-3 text-blue-500" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* منطقة التحرير */}
      <div className="flex-1 flex flex-col">
        {currentNote ? (
          <>
            {/* شريط العنوان */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <Input
                value={currentNote.title}
                onChange={(e) => updateNote(currentNote.id, { title: e.target.value })}
                className="text-lg font-bold border-0 bg-transparent focus-visible:ring-0"
                placeholder="عنوان الملاحظة"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateNote(currentNote.id, { isPinned: !currentNote.isPinned })}
                  className={currentNote.isPinned ? 'text-blue-500' : ''}
                >
                  <Pin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={showAIPanel ? 'text-blue-500' : ''}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteNote(currentNote.id);
                    toast.success('تم حذف الملاحظة');
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            {/* المحرر */}
            <div className="flex-1 flex">
              <div className="flex-1" onMouseUp={handleTextSelection}>
                <SimpleMarkdownEditor
                  value={currentNote.content}
                  onChange={handleContentChange}
                  placeholder="ابدأ الكتابة... استخدم Markdown للتنسيق"
                  className="h-full"
                />
              </div>

              {/* لوحة AI */}
              <AnimatePresence>
                {showAIPanel && (
                  <AIPanel
                    content={currentNote.content}
                    selectedText={selectedText}
                    onApplyEdit={handleApplyEdit}
                    onClose={() => setShowAIPanel(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">اختر ملاحظة أو أنشئ جديدة</p>
              <p className="text-sm mt-2">اضغط Ctrl+K للوصول السريع</p>
            </div>
          </div>
        )}
      </div>

      {/* نافذة إضافة ملاحظة */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ملاحظة جديدة</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>عنوان الملاحظة</Label>
            <Input
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="أدخل عنوان الملاحظة"
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddNote}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة إضافة مجلد */}
      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>مجلد جديد</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>اسم المجلد</Label>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="أدخل اسم المجلد"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFolderOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddFolder}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesView;
