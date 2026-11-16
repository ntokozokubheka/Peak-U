import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const INITIAL_COMMUNITY_DATA = {
  modulesFilter: 'All modules',
  topicsFilter: {
    questions: true,
    tips: true,
    resources: true,
    wellbeing: true,
    money: true,
  },
  houseRules: 'Be kind. Share methods, not submitted work. No cheating. Report anything harmful in one tap.',
  newPost: {
    title: '',
    module: '[MODULE A]',
    type: 'Question',
    content: '',
    anonymous: false,
  },
  sortBy: 'Newest',
  posts: [
    {
      id: 'p1',
      author: '[NAME]',
      year: '2nd year',
      degree: '[DEGREE]',
      timeAgo: '[TIME AGO]',
      type: 'QUESTION',
      title: 'How do I approach [TOPIC] questions in [MODULE A]?',
      body: '[Post text appears here. Students can describe the problem, share a tip or ask for resources.]',
      upvotes: 14,
      repliesCount: 3,
      saved: false,
      replies: [
        {
          id: 'r1',
          isBestAnswer: true,
          author: '[NAME]',
          role: 'MENTOR - 3RD YEAR',
          text: '[A clear answer that explains the method step by step.]',
          helpfulCount: 8,
        },
        {
          id: 'r2',
          isBestAnswer: false,
          author: '[NAME]',
          role: '',
          text: '[Another approach, or a follow-up question.]',
          helpfulCount: 4,
        },
      ],
      userReplyText: '',
      replyAnonymous: false,
    },
    {
      id: 'p2',
      author: '[NAME]',
      year: '2nd year',
      degree: '[DEGREE]',
      timeAgo: '[TIME AGO]',
      type: 'TIP',
      title: 'A study routine that worked for [MODULE B]',
      body: '[Post text appears here. Students can describe the problem, share a tip or ask for resources.]',
      upvotes: 22,
      repliesCount: 1,
      saved: false,
      replies: [],
      userReplyText: '',
      replyAnonymous: false,
    },
    {
      id: 'p3',
      author: '[NAME]',
      year: '2nd year',
      degree: '[DEGREE]',
      timeAgo: '[TIME AGO]',
      type: 'WELLBEING',
      title: 'Anyone else feeling the exam-season pressure?',
      body: '[Post text appears here. Students can describe the problem, share a tip or ask for resources.]',
      upvotes: 9,
      repliesCount: 2,
      saved: false,
      replies: [],
      userReplyText: '',
      replyAnonymous: false,
    },
  ],
};

export default function Community() {
  const [data, setData] = useState(INITIAL_COMMUNITY_DATA);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/community')
      .then((d) => {
        if (d) setData((prev) => ({ ...prev, ...d }));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleCreatePost(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const res = await api.post('/community/posts', data.newPost);
      setMessage(res?.message || 'Discussion posted successfully! +15 PTS');
      setData((prev) => ({
        ...prev,
        newPost: { title: '', module: '[MODULE A]', type: 'Question', content: '', anonymous: false },
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpvote(postId) {
    try {
      await api.post(`/community/posts/${postId}/upvote`);
      setData((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p)),
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSavePost(postId) {
    try {
      await api.post(`/community/posts/${postId}/save`);
      setData((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p)),
      }));
      setMessage('Post saved to your bookmarks.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmitReply(postId) {
    const post = data.posts.find((p) => p.id === postId);
    if (!post || !post.userReplyText.trim()) return;

    setError('');
    try {
      await api.post(`/community/posts/${postId}/reply`, {
        text: post.userReplyText,
        anonymous: post.replyAnonymous,
      });
      setMessage('Reply posted successfully! +10 PTS if helpful.');
      setData((prev) => ({
        ...prev,
        posts: prev.posts.map((p) =>
          p.id === postId ? { ...p, userReplyText: '', repliesCount: p.repliesCount + 1 } : p
        ),
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLoadMore() {
    setMessage('Loaded additional community posts.');
  }

  return (
    <>
      <h1 className="page-title" style={{ textTransform: 'uppercase' }}>Community</h1>
      <p className="page-sub">
        Ask, answer and share with students on your modules. Helpful replies earn points.
      </p>

      <ErrorNote error={error} />
      {message && <p className="note">{message}</p>}

      <div className="community-layout">
        {/* Sidebar Filters & Rules */}
        <div className="community-sidebar">
          {/* Module Filter */}
          <Card>
            <div className="community-filter-title">MODULE</div>
            {['All modules', '[MODULE A]', '[MODULE B]', '[MODULE C]'].map((mod) => (
              <label key={mod} className="community-radio-label">
                <input
                  type="radio"
                  name="moduleFilter"
                  checked={data.modulesFilter === mod}
                  onChange={() => setData({ ...data, modulesFilter: mod })}
                />
                {mod}
              </label>
            ))}
          </Card>

          {/* Topic Filter */}
          <Card>
            <div className="community-filter-title">TOPIC</div>
            {[
              { id: 'questions', label: 'Questions' },
              { id: 'tips', label: 'Tips' },
              { id: 'resources', label: 'Resources' },
              { id: 'wellbeing', label: 'Wellbeing' },
              { id: 'money', label: 'Money' },
            ].map((topic) => (
              <label key={topic.id} className="community-check-label">
                <input
                  type="checkbox"
                  checked={data.topicsFilter[topic.id]}
                  onChange={(e) =>
                    setData({
                      ...data,
                      topicsFilter: { ...data.topicsFilter, [topic.id]: e.target.checked },
                    })
                  }
                />
                {topic.label}
              </label>
            ))}
          </Card>

          {/* House Rules */}
          <Card>
            <div className="community-filter-title">HOUSE RULES</div>
            <p className="muted" style={{ fontSize: '12px', lineHeight: 1.5 }}>
              {data.houseRules}
            </p>
          </Card>
        </div>

        {/* Main Feed & Discussion Creator */}
        <div className="community-main-content">
          {/* Start a Discussion Card */}
          <Card>
            <div className="community-filter-title" style={{ marginBottom: 12 }}>START A DISCUSSION</div>
            <form onSubmit={handleCreatePost}>
              <div className="start-discussion-grid">
                <div>
                  <label className="field" htmlFor="disc-title">Title</label>
                  <input
                    id="disc-title"
                    type="text"
                    value={data.newPost.title}
                    onChange={(e) => setData({ ...data, newPost: { ...data.newPost, title: e.target.value } })}
                    placeholder="What's your question or topic?"
                    required
                  />
                </div>

                <div>
                  <label className="field" htmlFor="disc-mod">Module</label>
                  <select
                    id="disc-mod"
                    value={data.newPost.module}
                    onChange={(e) => setData({ ...data, newPost: { ...data.newPost, module: e.target.value } })}
                  >
                    <option value="[MODULE A]">[MODULE A]</option>
                    <option value="[MODULE B]">[MODULE B]</option>
                    <option value="[MODULE C]">[MODULE C]</option>
                  </select>
                </div>

                <div>
                  <label className="field" htmlFor="disc-type">Type</label>
                  <select
                    id="disc-type"
                    value={data.newPost.type}
                    onChange={(e) => setData({ ...data, newPost: { ...data.newPost, type: e.target.value } })}
                  >
                    <option value="Question">Question</option>
                    <option value="Tip">Tip</option>
                    <option value="Resource">Resource</option>
                    <option value="Wellbeing">Wellbeing</option>
                  </select>
                </div>
              </div>

              <label className="field" htmlFor="disc-content">What&apos;s on your mind?</label>
              <textarea
                id="disc-content"
                rows="3"
                value={data.newPost.content}
                onChange={(e) => setData({ ...data, newPost: { ...data.newPost, content: e.target.value } })}
                placeholder="Describe your problem, share a tip or ask for resources..."
                required
                style={{ resize: 'vertical' }}
              />

              <div className="post-action-row">
                <div className="post-action-left">
                  <button type="submit" className="pill solid" disabled={busy}>
                    {busy ? 'Posting...' : 'Post'}
                  </button>
                  <button
                    type="button"
                    className="pill"
                    style={{ fontSize: '12px', padding: '10px 16px' }}
                    onClick={() => setMessage('Study Lab problem attached to discussion.')}
                  >
                    Attach a Study Lab problem
                  </button>
                </div>

                <label className="community-check-label" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={data.newPost.anonymous}
                    onChange={(e) => setData({ ...data, newPost: { ...data.newPost, anonymous: e.target.checked } })}
                  />
                  Post anonymously
                </label>
              </div>
            </form>
          </Card>

          {/* Latest Posts Header */}
          <div className="posts-header-row">
            <h2 className="posts-header-title">Latest Posts</h2>
            <select
              style={{ width: '160px', padding: '8px 12px', fontSize: '13px', fontWeight: 800 }}
              value={data.sortBy}
              onChange={(e) => setData({ ...data, sortBy: e.target.value })}
            >
              <option value="Newest">Newest</option>
              <option value="Top">Top Voted</option>
              <option value="Unanswered">Unanswered</option>
            </select>
          </div>

          {/* Posts List */}
          {data.posts.map((post) => (
            <div key={post.id} className="community-post-card">
              <div className="post-top-meta">
                <div className="post-author-row">
                  <div className="post-author-avatar" />
                  <div className="post-author-info">
                    <h4>{post.author} · {post.year} · {post.degree}</h4>
                    <div className="post-time-sub">{post.timeAgo}</div>
                  </div>
                </div>
                <div className="post-type-badge">{post.type}</div>
              </div>

              <div className="post-title">{post.title}</div>
              <div className="post-body-text">{post.body}</div>

              {/* Action Buttons: Upvote, Replies, Save */}
              <div className="post-btn-row">
                <button className="pill small solid" onClick={() => handleUpvote(post.id)}>
                  ▲ UPVOTE · [{post.upvotes}]
                </button>
                <button className="pill small" style={{ borderColor: 'var(--blue)', color: 'var(--blue)' }}>
                  REPLIES · [{post.repliesCount}]
                </button>
                <button className="pill small" onClick={() => handleSavePost(post.id)}>
                  {post.saved ? 'SAVED ✓' : 'SAVE'}
                </button>
              </div>

              {/* Nested Replies */}
              {post.replies && post.replies.length > 0 && (
                <div className="nested-replies-wrap">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-top-bar">
                        {reply.isBestAnswer && <span className="best-answer-tag">✓ BEST ANSWER</span>}
                        <span>{reply.author}</span>
                        {reply.role && <span className="mentor-badge">{reply.role}</span>}
                      </div>
                      <div className="reply-text">{reply.text}</div>
                      <div className="reply-actions">
                        <button className="pill small" style={{ fontSize: '11px', padding: '4px 10px' }}>
                          ▲ HELPFUL · [{reply.helpfulCount}]
                        </button>
                        <button className="pill small" style={{ fontSize: '11px', padding: '4px 10px' }}>
                          REPLY
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Your Reply Input Box */}
              <div style={{ marginTop: 10, paddingTop: 14, borderTop: '1px solid #e6eef8' }}>
                <label className="field" htmlFor={`reply-${post.id}`}>YOUR REPLY</label>
                <textarea
                  id={`reply-${post.id}`}
                  rows="2"
                  value={post.userReplyText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setData((prev) => ({
                      ...prev,
                      posts: prev.posts.map((p) => (p.id === post.id ? { ...p, userReplyText: val } : p)),
                    }));
                  }}
                  placeholder="Share what helped you..."
                  style={{ resize: 'vertical', marginBottom: 10 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="pill solid"
                    style={{ fontSize: '12px', padding: '8px 18px', textTransform: 'uppercase' }}
                    onClick={() => handleSubmitReply(post.id)}
                  >
                    Post reply · +10 pts if helpful
                  </button>
                  <label className="community-check-label" style={{ fontSize: '12px', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={post.replyAnonymous}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setData((prev) => ({
                          ...prev,
                          posts: prev.posts.map((p) => (p.id === post.id ? { ...p, replyAnonymous: checked } : p)),
                        }));
                      }}
                    />
                    Reply anonymously
                  </label>
                </div>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          <div style={{ textAlign: 'center', margin: '20px 0 40px' }}>
            <button className="pill" style={{ padding: '12px 36px', textTransform: 'uppercase', fontSize: '13px' }} onClick={handleLoadMore}>
              Load More
            </button>
          </div>
        </div>
      </div>
    </>
  );
}