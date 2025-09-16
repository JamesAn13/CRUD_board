import axios from 'axios';

//axios 인스턴스 생성 - 기본 URL 설정( 모든 API 요청의 기본 주소)
//예: apiClient.get('/posts'), apiClient.post('/posts', data)
//baseURL은 백엔드 서버의 주소로 설정 (로컬 개발 환경에서는 localhost:4000/api,배포 환경에서는 실제 서버 주소로 변경 필요)
// axios.get('http://localhost:4000/api/posts') => apiClient.get('/posts') 사용 So 유지보수성 UP, 환경에 따라 쉽게 변경 가능
const apiClient = axios.create({
    baseURL: 'http://localhost:4000/api'
});

//요청 인터셉터 - 모든 API 요청이 보내지기 전에 이 코드가 먼저 실행
apiClient.interceptors.request.use(config => {
    //localstorage에 있는 토큰 가져와이
    const token = localStorage.getItem('token');

    //토큰 (O) -> 요청 헤더, Authorization에 토큰 추가
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
})

//게시글 목록 조회 함수, GET /api/posts ex) getPosts().then(res => console.log(res.data));
//검색어 기능 추가, page와 limit는 기본값 설정
export const getPosts = ( page = 1, limit = 10, search = "") => {
    return apiClient.get('/posts', {
        params: {
            page: page,
            limit: limit,
            search: search //search 파라미터 추가
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

//회원가입 함수, POST /api/register 
export const register = async ( username, password) => {
    return apiClient.post('/register', { username, password }); 
};

//로그인 함수, POST /api/login
export const login = async ( username, password) => {
    return apiClient.post('/login', { username, password });
};

//해당 사용자가 작성한 댓글 목록 가져오기, GET /api/my-comments
export const getMyComments = () => {
    return apiClient.get('/my-comments');
}
//대회 목록 가져오기, GET /api/tournaments
export const getTournaments = () => {
    return apiClient.get('/tournaments');
}
// 알림 목록 가져오기, GET /api/notifications
export const getNotifications = async () => {
    return apiClient.get('/notifications');
};
// 특정 알림 읽음 처리, PUT /api/notifications/:id/read
export const markNotificationAsRead = (id) => {
    return apiClient.put(`/notifications/${id}/read`);
};
// 모든 알림 읽음 처리, POST /api/notifications/read-all
export const markAllNotificationsAsRead = async () => {
    return apiClient.post('/notifications/read-all');
}


export default apiClient;