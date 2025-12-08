import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import Layout from '../components/Layout';
import './BlogForm.css';

// Read URLs from env
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

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

const BlogEdit = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    thumbnail: '',
    tags: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/blogs/${id}`);
        const blog = response.data.blog;
        if (blog) {
          setFormData({
            title: blog.title || '',
            slug: blog.slug || '',
            content: blog.content || '',
            thumbnail: blog.thumbnail || '',
            tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : ''
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading blog:', error);
        setError('Error loading blog: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
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

    try {
      const token = localStorage.getItem('token');
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      let thumbnailUrl = formData.thumbnail;

      // Thumbnail upload disabled (no backend route)
      /*
      if (thumbnailFile) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('image', thumbnailFile);

        const uploadRes = await axios.post(`${API_BASE_URL}/blogs/upload-image`, thumbnailFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        thumbnailUrl = uploadRes.data.url;
      }
      */

      await axios.put(`${API_BASE_URL}/blogs/${id}`, {
        ...formData,
        thumbnail: thumbnailUrl,
        tags: tagsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/blogs');
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Error updating blog');
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="blog-form-container">
        <h1>Edit Blog</h1>
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
            <label>Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="text"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Or Upload New Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            {(thumbnailPreview || formData.thumbnail) && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={thumbnailPreview || formData.thumbnail} 
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
            <button type="submit" className="btn-primary">Update Blog</button>
            <button type="button" onClick={() => navigate('/blogs')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BlogEdit;
