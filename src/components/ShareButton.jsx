import React, { useState } from 'react';
import { Share2, Copy, Check, Download } from 'lucide-react';
import Button from './Button';

const ShareButton = ({ content, fileName = 'rights-summary' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Know Your Rights Summary',
          text: content,
        });
      } catch (err) {
        console.error('Error sharing: ', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleShare}
        variant="secondary"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </Button>
      
      <Button
        onClick={handleCopy}
        variant="secondary"
        size="sm"
        className="flex items-center space-x-2"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        <span>{copied ? 'Copied!' : 'Copy'}</span>
      </Button>
      
      <Button
        onClick={handleDownload}
        variant="secondary"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Download</span>
      </Button>
    </div>
  );
};

export default ShareButton;