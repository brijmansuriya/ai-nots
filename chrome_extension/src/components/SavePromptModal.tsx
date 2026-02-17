import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { TokenCounter } from './TokenCounter';
import type { Category, Tag, Platform } from '../services/api';
import './SavePromptModal.css';

interface SavePromptModalProps {
  promptText: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const SavePromptModal = ({ promptText, onSuccess, onCancel }: SavePromptModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['ChatGPT']);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // Auto-generate title from prompt (first 50 chars)
    const autoTitle = promptText.trim().slice(0, 50).replace(/\n/g, ' ');
    setTitle(autoTitle || 'Untitled Prompt');

    // Load categories, tags, and platforms
    const loadData = async () => {
      try {
        setLoading(true);
        const [cats, tagList, platformList] = await Promise.all([
          apiService.getCategories(),
          apiService.getTags(),
          apiService.getPlatforms(),
        ]);

        setCategories(cats);
        setTags(tagList);
        setPlatforms(platformList);

        // Set default category (first available)
        // If no categories found, we'll need to handle this in the submit
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        } else {
          setError('No categories available. Please configure your backend API.');
        }

        // Ensure ChatGPT platform is selected
        const chatGPTPlatform = platformList.find(p =>
          p.name.toLowerCase().includes('chatgpt') || p.name.toLowerCase() === 'chatgpt'
        );
        if (chatGPTPlatform) {
          setSelectedPlatforms([chatGPTPlatform.name]);
        } else if (platformList.length > 0) {
          setSelectedPlatforms([platformList[0].name]);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load categories, tags, or platforms. Please check your API configuration.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTagAdd = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleTagAdd(tagInput);
    }
  };

  const handlePlatformToggle = (platformName: string) => {
    if (selectedPlatforms.includes(platformName)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformName));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    // Ensure we have a valid category_id
    // If not selected but categories exist, use the first one
    let finalCategoryId = categoryId;
    if (!finalCategoryId && categories.length > 0) {
      finalCategoryId = categories[0].id;
    }

    if (!finalCategoryId) {
      setError('Please select a category or ensure categories are available');
      return;
    }

    if (selectedTags.length === 0) {
      setError('At least one tag is required');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('At least one platform is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await apiService.savePrompt({
        title: title.trim(),
        prompt: promptText.trim(),
        description: description.trim() || undefined,
        category_id: finalCategoryId,
        tags: selectedTags,
        platform: selectedPlatforms,
      });

      onSuccess();
    } catch (err) {
      console.error('Failed to save prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to save prompt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="save-prompt-modal-overlay" onClick={onCancel}>
        <div className="save-prompt-modal" onClick={(e) => e.stopPropagation()}>
          <div className="save-prompt-modal-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="save-prompt-modal-overlay" onClick={onCancel}>
      <div className="save-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="save-prompt-modal-header">
          <h2>Save Prompt to AI Notes</h2>
          <button className="save-prompt-modal-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="save-prompt-modal-form">
          <div className="save-prompt-modal-field">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={255}
              placeholder="Enter prompt title"
            />
          </div>

          <div className="save-prompt-modal-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Optional description"
              rows={3}
            />

            <TokenCounter
              text={promptText}
              selectedPlatformIds={selectedPlatforms}
              platforms={platforms}
            />
          </div>

          <div className="save-prompt-modal-field">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
            >
              <option value={0}>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="save-prompt-modal-field">
            <label htmlFor="tags">Tags *</label>
            <div className="save-prompt-modal-tags">
              <div className="save-prompt-modal-tags-input">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type tag and press Enter"
                />
                <button
                  type="button"
                  onClick={() => handleTagAdd(tagInput)}
                  disabled={!tagInput.trim()}
                >
                  Add
                </button>
              </div>
              <div className="save-prompt-modal-tags-list">
                {selectedTags.map((tag) => (
                  <span key={tag} className="save-prompt-modal-tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="save-prompt-modal-tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {tags.length > 0 && (
                <div className="save-prompt-modal-tags-suggestions">
                  <small>Suggestions: </small>
                  {tags.slice(0, 5).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagAdd(tag.name)}
                      className="save-prompt-modal-tag-suggestion"
                      disabled={selectedTags.includes(tag.name)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="save-prompt-modal-field">
            <label>Platforms *</label>
            <div className="save-prompt-modal-platforms">
              {platforms.map((platform) => (
                <label key={platform.id} className="save-prompt-modal-platform">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.name)}
                    onChange={() => handlePlatformToggle(platform.name)}
                  />
                  <span>{platform.name}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="save-prompt-modal-error">{error}</div>
          )}

          <div className="save-prompt-modal-actions">
            <button
              type="button"
              onClick={onCancel}
              className="save-prompt-modal-button cancel"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-prompt-modal-button submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavePromptModal;

