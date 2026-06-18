import { Share2, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import './ShareCard.css';

export default function ShareCard({ event }) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const eventUrl = `${window.location.origin}/event/${event.id}`;
  const shareText = `🎟️ Check out "${event.title}" on tickt! ${event.date} @ ${event.venue}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Could not copy link.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: eventUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      setShowMenu(prev => !prev);
    }
  };

  return (
    <div className="share-card-wrapper">
      <button className="share-trigger-btn" onClick={handleNativeShare}>
        <Share2 size={18} />
        <span>Share</span>
      </button>

      {showMenu && (
        <div className="share-dropdown animate-fade-in">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-option"
          >
            Share on X / Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-option"
          >
            Share on Facebook
          </a>
          <button className="share-option" onClick={handleCopyLink}>
            {copied ? <Check size={18} className="text-success" /> : <Link2 size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
}
