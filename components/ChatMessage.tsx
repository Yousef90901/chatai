

import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender } from '../types';

interface ChatMessageProps {
  message: Message;
  onImageClick: (src: string) => void;
  userProfilePicture?: string;
  otherUserProfilePicture?: string;
  isVerified?: boolean;
}

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.32 17.57 9.55 13 17 12V8z"/>
        <path d="M17 3c-5.52 0-10 4.48-10 10 0 .55.45 1 1 1s1-.45 1-1c0-4.41 3.59-8 8-8 .55 0 1-.45 1-1s-.45-1-1-1z"/>
    </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const formatMarkdown = (text: string = "") => {
    const mermaidDiagrams: string[] = [];
    let processedText = text;

    // Placeholder for diagrams to protect them from other markdown processing
    const placeholder = (index: number) => `__MERMAID_PLACEHOLDER_${index}__`;

    // 1. Extract FENCED mermaid blocks
    processedText = processedText.replace(/```mermaid\n([\s\S]*?)\n```/g, (match, code) => {
        mermaidDiagrams.push(code);
        return placeholder(mermaidDiagrams.length - 1);
    });

    // 2. Extract UNFENCED mermaid blocks (heuristic: starts with 'graph', etc. at the beginning of a line)
    processedText = processedText.replace(/^(graph (?:TD|LR|BT|RL)|sequenceDiagram|gantt|pie)[\s\S]*/gm, (match) => {
        if (match.startsWith('__MERMAID_PLACEHOLDER_')) {
            return match;
        }
        mermaidDiagrams.push(match);
        return placeholder(mermaidDiagrams.length - 1);
    });
    
    // Pad with newlines to make subsequent regex for lists/tables easier
    let html = `\n${processedText}\n`;

    // Tables
    html = html.replace(/\n((?:\|.*\|.*\r?\n)+)/g, (match, tableBlock) => {
      try {
        const rows = tableBlock.trim().split(/\r?\n/);
        if (rows.length < 2 || !rows[1].match(/^\|(?:\s*:?-+:?\s*\|)+$/)) {
            return match; // Return original if not a valid table
        }
        let tableHtml = `<div class="my-4 shadow-sm rounded-lg border overflow-hidden overflow-x-auto" style="border-color: var(--border-color);"><table class="w-full table-fixed text-xs text-right divide-y" style="divide-color: var(--border-color);">`;
        const headerCells = rows[0].split('|').slice(1, -1);
        tableHtml += '<thead style="background-color: var(--bg-hover);"><tr>';
        headerCells.forEach(cell => {
            tableHtml += `<th scope="col" class="p-2 font-semibold uppercase tracking-wider break-words" style="color: var(--text-primary);">${cell.trim()}</th>`;
        });
        tableHtml += '</tr></thead>';
        tableHtml += '<tbody class="divide-y" style="background-color: var(--bg-main); divide-color: var(--border-color);">';
        rows.slice(2).forEach(rowStr => {
            const cells = rowStr.split('|').slice(1, -1);
            tableHtml += '<tr>';
            cells.forEach(cell => {
                const cellContent = cell.trim().replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
                tableHtml += `<td class="p-2 break-words whitespace-pre-wrap" style="color: var(--text-primary);">${cellContent}</td>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table></div>';
        return `\n${tableHtml}\n`;
      } catch (e) {
        console.error('Failed to parse markdown table:', e);
        return match;
      }
    });

    // Unordered lists
    html = html.replace(/\n((?:\s*[-*]\s.*\r?\n)+)/g, (match, listBlock) => {
        const items = listBlock.trim().split(/\r?\n/).map(item => `<li>${item.replace(/^\s*[-*]\s/, '').trim()}</li>`).join('');
        return `\n<ul class="list-disc list-inside my-2 pr-5 space-y-1">${items}</ul>\n`;
    });
    // Ordered lists
    html = html.replace(/\n((?:\s*\d+\.\s.*\r?\n)+)/g, (match, listBlock) => {
        const items = listBlock.trim().split(/\r?\n/).map(item => `<li>${item.replace(/^\s*\d+\.\s/, '').trim()}</li>`).join('');
        return `\n<ol class="list-decimal list-inside my-2 pr-5 space-y-1">${items}</ol>\n`;
    });

    // Headings
    html = html.replace(/\n#### (.*)/g, '\n<h4 class="text-md font-bold mt-3 mb-1">$1</h4>');
    html = html.replace(/\n### (.*)/g, '\n<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/\n## (.*)/g, `\n<h2 class="text-xl font-bold mt-5 mb-3 border-b pb-2" style="border-color: var(--border-color);">$1</h2>`);
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Restore mermaid diagrams
    mermaidDiagrams.forEach((code, index) => {
        const safeCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const mermaidDiv = `<div dir="ltr" class="mermaid my-4 p-4 rounded-lg bg-white dark:bg-gray-800 flex justify-center">${safeCode}</div>`;
        html = html.replace(placeholder(index), mermaidDiv);
    });

    return { __html: html.trim() };
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message, onImageClick, userProfilePicture, otherUserProfilePicture, isVerified }) => {
  const isUser = message.sender === Sender.User;
  const [isCopied, setIsCopied] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const messageContentRef = useRef<HTMLDivElement>(null);

  // Render mermaid diagrams
  useEffect(() => {
    // Check for placeholder presence as well
    if (messageContentRef.current && message.text && (message.text.includes('```mermaid') || message.text.match(/^(graph|sequenceDiagram|gantt|pie)/m))) {
        try {
            const mermaidElements = messageContentRef.current.querySelectorAll<HTMLElement>('.mermaid');
            if (mermaidElements.length > 0) {
                 // Hide elements until they are rendered to prevent flash of code
                 mermaidElements.forEach(el => el.style.visibility = 'hidden');

                (window as any).mermaid.run({ nodes: mermaidElements }).then(() => {
                     mermaidElements.forEach(el => {
                        el.style.visibility = 'visible';
                     });
                });
            }
        } catch (e) {
            console.error("Failed to render mermaid diagram:", e);
        }
    }
  }, [message.text]);
  
  const MAX_LENGTH = 700;
  const isLongText = message.text && message.text.length > MAX_LENGTH;

  const handleCopy = () => {
    if (!message.text) return;

    const fallbackCopy = (text: string) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        }
      } catch (err) {
        console.error('Fallback: Error copying text: ', err);
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(message.text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.warn('navigator.clipboard.writeText failed, falling back. Error: ', err);
        fallbackCopy(message.text as string);
      });
    } else {
      fallbackCopy(message.text);
    }
  };
  
  const UserAvatar = () => (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-user-message)'}}>
      {userProfilePicture ? (
        <img src={userProfilePicture} alt="User" className="w-full h-full rounded-full object-cover" />
      ) : (
        <UserIcon className="w-6 h-6" style={{ color: 'var(--text-user-message)'}} />
      )}
    </div>
  );
  
  const OtherUserAvatar = () => (
     <div className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-ai-message)'}}>
        {otherUserProfilePicture ? (
            <img src={otherUserProfilePicture} alt="AI" className="w-full h-full rounded-full object-cover" />
        ) : (
            <LogoIcon className="w-6 h-6" style={{ color: 'var(--accent-primary)'}} />
        )}
        {isVerified && (
            <svg className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white dark:bg-gray-800 rounded-full" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        )}
    </div>
  );

  const displayedText = isLongText && !showFullText ? `${message.text.substring(0, MAX_LENGTH)}...` : message.text;


  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <OtherUserAvatar />}
      <div ref={messageContentRef} className={`group relative w-full max-w-4xl`}>
         {message.images && message.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-2 p-4 rounded-xl" style={{ backgroundColor: isUser ? 'var(--bg-user-message)' : 'var(--bg-ai-message)' }}>
            {message.images.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`Image ${index + 1}`} 
                className="rounded-lg w-full h-auto object-cover cursor-pointer transition-transform hover:scale-105"
                onClick={() => onImageClick(image)}
              />
            ))}
          </div>
        )}
        {message.text && (
            <div 
                className="p-4 rounded-xl" 
                style={{ 
                    backgroundColor: isUser ? 'var(--bg-user-message)' : 'var(--bg-ai-message)',
                    color: isUser ? 'var(--text-user-message)' : 'var(--text-ai-message)'
                }}
            >
                <div 
                    className="text-base leading-relaxed whitespace-pre-wrap" 
                    dangerouslySetInnerHTML={formatMarkdown(displayedText)}
                ></div>
                {isLongText && (
                    <button 
                        onClick={() => setShowFullText(!showFullText)}
                        className="font-semibold mt-2"
                        style={{ color: 'var(--accent-primary)'}}
                    >
                        {showFullText ? 'عرض أقل' : 'اقرأ المزيد'}
                    </button>
                )}
            </div>
        )}
        {!isUser && message.text && (
          <div className="absolute bottom-2 left-2">
            <button 
              onClick={handleCopy}
              className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={isCopied ? "تم النسخ" : "نسخ النص"}
            >
              {isCopied ? (
                <CheckIcon className="w-4 h-4 text-green-500" />
              ) : (
                <CopyIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
      {isUser && <UserAvatar />}
    </div>
  );
};

export default ChatMessage;