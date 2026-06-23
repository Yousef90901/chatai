import React, { useState, useRef, ChangeEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string, files: File[]) => void;
  isLoading: boolean;
  onStopGeneration: () => void;
  onToggleVoiceSession: () => void;
  onInputFocus: () => void;
}

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
);

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zM8 8a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onStopGeneration, onToggleVoiceSession, onInputFocus }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const placeholderText = "اكتب رسالتك هنا...";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);

      const newPreviewsPromises: Promise<string>[] = newFiles.map((file: File) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(newPreviewsPromises).then(newPreviews => {
        setFilePreviews(prev => [...prev, ...newPreviews]);
      });
    }
  };
  
  const handleCameraCapture = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const capturedFiles = Array.from(e.target.files);
        // Immediately send the message with the current text and the captured photo.
        onSendMessage(text, capturedFiles);
        
        // Reset the input state after sending.
        setText('');
        setFiles([]);
        setFilePreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
        }
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setFilePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    if(cameraInputRef.current) {
        cameraInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (isLoading || (!text.trim() && files.length === 0)) return;
    onSendMessage(text, files);
    setText('');
    setFiles([]);
    setFilePreviews([]);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    if(cameraInputRef.current) {
        cameraInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
        <div className="w-full max-w-4xl mx-auto flex justify-center items-center p-2 h-[56px]">
            <button
              onClick={onStopGeneration}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 flex items-center space-x-2 space-x-reverse transition-colors"
              aria-label="إيقاف توليد الرد"
            >
                <StopIcon className="h-5 w-5" />
                <span>إيقاف</span>
            </button>
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {filePreviews.length > 0 && (
        <div className="mb-2 p-2 rounded-lg overflow-x-auto" style={{ backgroundColor: 'var(--bg-input)'}}>
          <div className="flex space-x-3 space-x-reverse pb-2">
            {filePreviews.map((preview, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img src={preview} alt={`preview ${index}`} className="w-20 h-20 rounded-md object-cover border-2" style={{ borderColor: 'var(--bg-main)'}} />
                <button 
                  onClick={() => handleRemoveFile(index)} 
                  className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                  aria-label="إزالة الصورة"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-end space-x-2 space-x-reverse rounded-full p-2" style={{ backgroundColor: 'var(--bg-input)'}}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onInputFocus}
          placeholder={placeholderText}
          className="flex-1 bg-transparent px-2 py-2 focus:outline-none resize-none"
          style={{ color: 'var(--text-primary)' }}
          rows={1}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="file-upload"
          multiple
        />
        <input
            type="file"
            ref={cameraInputRef}
            onChange={handleCameraCapture}
            accept="image/*"
            capture="environment"
            className="hidden"
            id="camera-upload"
        />
        <>
            <button
                onClick={onToggleVoiceSession}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="بدء المحادثة الصوتية"
            >
                <MicrophoneIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => cameraInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                 style={{ color: 'var(--text-secondary)' }}
                aria-label="التقاط صورة"
            >
                <CameraIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
               style={{ color: 'var(--text-secondary)' }}
              aria-label="إرفاق صورة"
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
        </>
        <button
          onClick={handleSend}
          disabled={!text.trim() && files.length === 0}
          className="text-white rounded-full p-2 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: 'var(--accent-primary)'}}
          aria-label="إرسال الرسالة"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;