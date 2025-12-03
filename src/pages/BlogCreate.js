import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
import Layout from '../components/Layout';
import './BlogForm.css';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      let thumbnailUrl = formData.thumbnail;

      // Upload thumbnail if file is selected
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

      await axios.post('http://localhost:5000/api/blogs', {
        ...formData,
        thumbnail: thumbnailUrl,
        tags: tagsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/blogs');
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating blog');
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
            <label>Slug *</label>
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
