import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare } from 'lucide-react';

export const FeedbackModal = ({ isOpen, onClose, onSubmit, ticketId }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="max-w-md w-full glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Rate Resolution Quality</h3>
          <p className="text-xs text-slate-400 mt-1">
            How satisfied are you with the resolution of <span className="font-mono text-blue-400 font-bold">{ticketId}</span>?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selector */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-xs font-semibold text-amber-400">
            {rating === 5 && '🌟 Excellent / Problem fully solved!'}
            {rating === 4 && '👍 Good / Timely resolution'}
            {rating === 3 && '👌 Satisfactory / Average'}
            {rating === 2 && '👎 Needs improvement'}
            {rating === 1 && '⚠️ Poor / Unsatisfied'}
          </p>

          {/* Feedback Review Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Additional Feedback / Comments (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Tell us what went well or how we can improve..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 shadow-glow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Rating & Close'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
