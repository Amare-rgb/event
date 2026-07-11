// app/components/CommentsSection.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

interface Comment {
  id: number;
  name: string;
  email?: string;
  comment: string;
  created_at: string;
}

export default function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Wrap fetchComments in useCallback to prevent unnecessary re-renders
  const fetchComments = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      const response = await fetch('/api/comments');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setComments(data.comments || []);
      setError('');
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please refresh the page.');
      setComments([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Load comments on mount
  useEffect(() => {
  const loadData = async () => {
    await fetchComments();
  };
  
  loadData();
}, [fetchComments]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !newComment.trim()) {
      setError('Please fill in name and comment');
      return;
    }

    if (newComment.trim().length < 3) {
      setError('Comment must be at least 3 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Post comment
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName.trim(),
          email: userEmail.trim() || null,
          comment: newComment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add comment');
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Clear form
        setNewComment('');
        setSuccess('Comment added successfully!');
        
        // Refresh comments - IMPORTANT: Wait for fetch to complete
        await fetchComments();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error adding comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isInitialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-5 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900">Comments</h3>
              <p className="text-[10px] text-gray-500">Share your thoughts</p>
            </div>
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
              {comments.length}
            </span>
          </div>
          {/* Refresh button */}
          <button
            onClick={fetchComments}
            className="text-gray-400 hover:text-orange-500 transition-colors text-sm p-1"
            title="Refresh comments"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Add Comment Form */}
        <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-lg p-3 md:p-4 mb-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Leave a Comment</h4>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name *"
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Your Email (optional)"
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isLoading}
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 text-sm disabled:opacity-50 whitespace-nowrap"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
                <span className="hidden xs:inline">Post</span>
              </button>
            </div>
            {error && <p className="text-red-500 text-[10px]">{error}</p>}
            {success && <p className="text-green-500 text-[10px]">{success}</p>}
          </form>
        </div>

        {/* Comments List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-6 text-sm">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              No comments yet. Be the first!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 rounded-lg p-2.5 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {comment.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.name || 'Unknown User'}
                      </span>
                      {comment.email && (
                        <span className="text-[10px] text-gray-400">
                          {comment.email}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 break-words">{comment.comment}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}