import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import Layout from '../components/Layout';
import './BlogForm.css';

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
        const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        // Fix: Extract blog from response.data.blog
        const blog = response.data.blog;
        setFormData({
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          thumbnail: blog.thumbnail || '',
          tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : ''
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      let thumbnailUrl = formData.thumbnail;

      // Upload new thumbnail if file is selected
      if (thumbnailFile) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('image', thumbnailFile);

        const uploadRes = await axios.post('http://localhost:5000/api/blogs/upload-image', thumbnailFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        thumbnailUrl = uploadRes.data.url;
      }

      await axios.put(`http://localhost:5000/api/blogs/${id}`, {
        ...formData,
        thumbnail: thumbnailUrl,
        tags: tagsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/blogs');
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Error updating blog');
    }
  };

  const uploadAdapter = (loader) => {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          loader.file.then(file => {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            axios.post('http://localhost:5000/api/blogs/upload-image', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
              }
            })
            .then(res => {
              resolve({ default: `http://localhost:5000${res.data.url}` });
            })
            .catch(err => reject(err));
          });
        });
      }
    };
  };

  function uploadPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return uploadAdapter(loader);
    };
  }

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
            <CKEditor
              editor={ClassicEditor}
              config={{
                extraPlugins: [uploadPlugin],
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'imageUpload', 'blockQuote', 'undo', 'redo']
              }}
              data={formData.content}
              onChange={(event, editor) => {
                const data = editor.getData();
                setFormData({ ...formData, content: data });
              }}
            />
          </div>
          <div className="form-group">
            <label>Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            {(thumbnailPreview || formData.thumbnail) && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={thumbnailPreview || `http://localhost:5000${formData.thumbnail}`} 
                  alt="Thumbnail preview" 
                  style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '4px' }}
                />
              </div>
            )}
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
