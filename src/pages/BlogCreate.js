import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import Layout from '../components/Layout';
import './BlogForm.css';

// Read final URLs directly from env
const BLOG_CREATE_URL = process.env.REACT_APP_BLOG_CREATE_URL;
const UPLOAD_URL = process.env.REACT_APP_BLOG_UPLOAD_URL;

// Quill toolbar configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    ['clean']
  ]
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'link', 'image', 'blockquote', 'code-block'
];

const BlogCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    thumbnail: '',
    tags: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1) Validate that BLOG_CREATE_URL is configured
    if (!BLOG_CREATE_URL) {
      setError('BLOG_CREATE_URL is not set in .env. Please configure your backend blog create URL.');
      console.error('Missing BLOG_CREATE_URL env variable');
      return;
    }

    console.log('Creating blog via URL:', BLOG_CREATE_URL);

    try {
      const token = localStorage.getItem('token');
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      let thumbnailUrl = formData.thumbnail;

      // 2) Thumbnail upload disabled because backend route does not exist
      /*
      if (thumbnailFile && UPLOAD_URL) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('image', thumbnailFile);

        const uploadRes = await axios.post(UPLOAD_URL, thumbnailFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        thumbnailUrl = uploadRes.data.url;
      }
      */

      // 3) Call backend create-blog endpoint
      await axios.post(
        BLOG_CREATE_URL,
        {
          ...formData,
          thumbnail: thumbnailUrl,
          tags: tagsArray
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/blogs');
    } catch (err) {
      console.error('Blog create error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: BLOG_CREATE_URL
      });

      // If backend returns 404, show a specific hint
      if (err.response?.status === 404) {
        setError(
          `404 Not Found: The URL "${BLOG_CREATE_URL}" does not exist on the backend. ` +
          'Check your backend route and REACT_APP_BLOG_CREATE_URL in .env.'
        );
        return;
      }

      setError(err.response?.data?.error || err.response?.data?.message || 'Error creating blog');
    }
  };

  return (
    <Layout>
      <div className="blog-form-container">
        <h1>Create New Blog</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Leave empty to auto-generate"
            />
          </div>
          <div className="form-group">
            <label>Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            {thumbnailPreview && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail preview" 
                  style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '4px' }}
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div className="form-group">
            <label>Content *</label>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={quillModules}
              formats={quillFormats}
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Create Blog</button>
            <button type="button" onClick={() => navigate('/blogs')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BlogCreate;
