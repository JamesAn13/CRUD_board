import React from 'react';
import '../styles/Modal.css';

function Modal({ isOpen, onClose, onSave, post }) {
  const [editedPost, setEditedPost] = React.useState(post);

  React.useEffect(() => {
    setEditedPost(post);
  }, [post]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPost({ ...editedPost, [name]: value });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>게시글 수정</h2>
        <input
          name="title"
          value={editedPost?.title || ''}
          onChange={handleChange}
          placeholder="제목"
        />
        <input
          name="author"
          value={editedPost?.author || ''}
          onChange={handleChange}
          placeholder="작성자"
        />
        <textarea
          name="content"
          value={editedPost?.content || ''}
          onChange={handleChange}
          placeholder="내용"
        />
        <button onClick={() => onSave(editedPost)}>저장</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
}

export default Modal;
