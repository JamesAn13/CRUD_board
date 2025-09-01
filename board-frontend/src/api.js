import axios from 'axios';

//axios 인스턴스 생성 - 기본 URL 설정( 모든 API 요청의 기본 주소)
//예: apiClient.get('/posts'), apiClient.post('/posts', data)
//baseURL은 백엔드 서버의 주소로 설정 (로컬 개발 환경에서는 localhost:4000/api,배포 환경에서는 실제 서버 주소로 변경 필요)
// axios.get('http://localhost:4000/api/posts') => apiClient.get('/posts') 사용 So 유지보수성 UP, 환경에 따라 쉽게 변경 가능
const apiClient = axios.create({
    baseURL: 'http://localhost:4000/api'
});

//게시글 목록 조회 함수, GET /api/posts ex) getPosts().then(res => console.log(res.data));
export const getPosts = ( page = 1, limit = 10) => {
    return apiClient.get('/posts', {
        params: {
            page: page,
            limit: limit
        }
    });
};

// 상세조회, 특정 ID의 게시글 조회 함수, GET /api/posts/:id ex) getPostById(1).then(res => console.log(res.data))
export const getPostById = (id) => {
    return apiClient.get(`/posts/${id}`);
};

//게시글 작성 함수, POST /api/posts ex) createPost({title: '제목', content: '내용', author: '작성자'}).then(res => console.log(res.data))
export const createPost = (postData) => {
    return apiClient.post(`/posts`, postData);
};

//게시글 수정 함수, PUT /api/posts/:id ex) updatePost(1, {title: '새 제목', content: '새 내용', author: '새 작성자'}).then(res => console.log(res.data))
export const updatePost = (id, postData) => {
    return apiClient.put(`/posts/${id}`, postData);
};

//게시글 삭제 함수, DELETE /api/posts/:id ex) deletePost(1).then(res => console.log(res.data))
export const deletePost = (id) => {
    return apiClient.delete(`/posts/${id}`);
};

//댓글 목록 가져오기(postId에 해당하는 글의 모든 댓글을 가져옴), GET /api/posts/:postId/comments
export const getComments = (postId) =>{
    return apiClient.get(`/posts/${postId}/comments`);
};

//댓글 작성 함수, POST /api/posts/:postId/comments
export const createComment = (postId, commentData) => {
    return apiClient.post(`/posts/${postId}/comments`, commentData);
};

//댓글 삭제 함수, DELETE /api/posts/:postId/comments/:commentId
export const deleteComment = (postId, comments) => {
    return apiClient.delete(`/posts/${postId}/comments/${comments}`);
}
