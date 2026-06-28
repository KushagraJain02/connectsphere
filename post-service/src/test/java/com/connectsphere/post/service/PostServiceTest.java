package com.connectsphere.post.service;

import com.connectsphere.post.dto.CommentRequest;
import com.connectsphere.post.dto.CommentResponse;
import com.connectsphere.post.dto.CreatePostRequest;
import com.connectsphere.post.dto.PostResponse;
import com.connectsphere.post.dto.event.PostEvent;
import com.connectsphere.post.entity.Comment;
import com.connectsphere.post.entity.Like;
import com.connectsphere.post.entity.Post;
import com.connectsphere.post.repository.CommentRepository;
import com.connectsphere.post.repository.LikeRepository;
import com.connectsphere.post.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Post Service Tests")
class PostServiceTest {

    @Mock private PostRepository postRepository;
    @Mock private LikeRepository likeRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private CloudinaryService cloudinaryService;
    @Mock private KafkaTemplate<String, PostEvent> kafkaTemplate;

    @InjectMocks private PostService postService;

    private Post mockPost;
    private static final String USER_ID = "user-123";
    private static final String POST_ID = "post-123";

    @BeforeEach
    void setUp() {
        mockPost = Post.builder()
                .id(POST_ID)
                .authorId(USER_ID)
                .authorName("Rahul Sharma")
                .content("Test post content")
                .type(Post.PostType.TEXT)
                .likeCount(0)
                .commentCount(0)
                .build();
    }

    // ── Create Post Tests ──────────────────────────────────

    @Test
    @DisplayName("Create post — saves and returns response")
    void createPost_Success() throws Exception {
        CreatePostRequest req = new CreatePostRequest();
        req.setContent("Hello ConnectSphere!");
        req.setType("TEXT");

        when(postRepository.save(any(Post.class))).thenReturn(mockPost);

        PostResponse response = postService.createPost(USER_ID, "Rahul Sharma", req, null);

        assertThat(response).isNotNull();
        assertThat(response.getAuthorId()).isEqualTo(USER_ID);
        verify(postRepository).save(any(Post.class));
        verify(kafkaTemplate).send(eq("post-events"), any(PostEvent.class));
    }

    @Test
    @DisplayName("Create post — Kafka event is published")
    void createPost_PublishesKafkaEvent() throws Exception {
        CreatePostRequest req = new CreatePostRequest();
        req.setContent("Kafka test post");
        req.setType("TEXT");

        when(postRepository.save(any())).thenReturn(mockPost);

        postService.createPost(USER_ID, "Rahul Sharma", req, null);

        verify(kafkaTemplate, times(1)).send(eq("post-events"), any(PostEvent.class));
    }

    // ── Feed Tests ─────────────────────────────────────────

    @Test
    @DisplayName("Get feed — returns paginated posts")
    void getFeed_ReturnsPaginatedPosts() {
        List<Post> posts = List.of(mockPost);
        Page<Post> page = new PageImpl<>(posts, PageRequest.of(0, 10), 1);

        when(postRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(page);
        when(likeRepository.existsByPostIdAndUserId(any(), any())).thenReturn(false);

        Page<PostResponse> result = postService.getFeed(USER_ID, 0, 10);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(POST_ID);
    }

    @Test
    @DisplayName("Get feed — likedByMe is true when user liked the post")
    void getFeed_LikedByMe_IsTrue() {
        Page<Post> page = new PageImpl<>(List.of(mockPost));

        when(postRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(page);
        when(likeRepository.existsByPostIdAndUserId(POST_ID, USER_ID)).thenReturn(true);

        Page<PostResponse> result = postService.getFeed(USER_ID, 0, 10);

        assertThat(result.getContent().get(0).isLikedByMe()).isTrue();
    }

    // ── Like Tests ─────────────────────────────────────────

    @Test
    @DisplayName("Toggle like — adds like when not already liked")
    void toggleLike_AddsLike() {
        when(postRepository.findById(POST_ID)).thenReturn(Optional.of(mockPost));
        when(likeRepository.existsByPostIdAndUserId(POST_ID, USER_ID)).thenReturn(false);

        String result = postService.toggleLike(POST_ID, USER_ID, "Rahul Sharma");

        assertThat(result).isEqualTo("liked");
        verify(likeRepository).save(any(Like.class));
        verify(postRepository).incrementLikeCount(POST_ID);
        verify(kafkaTemplate).send(eq("post-events"), any(PostEvent.class));
    }

    @Test
    @DisplayName("Toggle like — removes like when already liked")
    void toggleLike_RemovesLike() {
        Like existingLike = Like.builder().id("like-1").postId(POST_ID).userId(USER_ID).build();

        when(postRepository.findById(POST_ID)).thenReturn(Optional.of(mockPost));
        when(likeRepository.existsByPostIdAndUserId(POST_ID, USER_ID)).thenReturn(true);
        when(likeRepository.findByPostIdAndUserId(POST_ID, USER_ID))
                .thenReturn(Optional.of(existingLike));

        String result = postService.toggleLike(POST_ID, USER_ID, "Rahul Sharma");

        assertThat(result).isEqualTo("unliked");
        verify(likeRepository).delete(existingLike);
        verify(postRepository).decrementLikeCount(POST_ID);
    }

    @Test
    @DisplayName("Toggle like — no Kafka event when unliking")
    void toggleLike_NoKafkaEventOnUnlike() {
        Like existingLike = Like.builder().id("like-1").postId(POST_ID).userId(USER_ID).build();

        when(postRepository.findById(POST_ID)).thenReturn(Optional.of(mockPost));
        when(likeRepository.existsByPostIdAndUserId(POST_ID, USER_ID)).thenReturn(true);
        when(likeRepository.findByPostIdAndUserId(POST_ID, USER_ID))
                .thenReturn(Optional.of(existingLike));

        postService.toggleLike(POST_ID, USER_ID, "Rahul");

        verify(kafkaTemplate, never()).send(any(), any(PostEvent.class));
    }

    // ── Comment Tests ──────────────────────────────────────

    @Test
    @DisplayName("Add comment — saves and returns response")
    void addComment_Success() {
        CommentRequest req = new CommentRequest();
        req.setContent("Great post!");

        Comment savedComment = Comment.builder()
                .id("comment-1")
                .postId(POST_ID)
                .authorId(USER_ID)
                .authorName("Rahul Sharma")
                .content("Great post!")
                .build();

        when(postRepository.findById(POST_ID)).thenReturn(Optional.of(mockPost));
        when(commentRepository.save(any())).thenReturn(savedComment);

        CommentResponse response = postService.addComment(POST_ID, USER_ID, "Rahul Sharma", req);

        assertThat(response.getContent()).isEqualTo("Great post!");
        assertThat(response.getAuthorId()).isEqualTo(USER_ID);
        verify(postRepository).incrementCommentCount(POST_ID);
        verify(kafkaTemplate).send(eq("post-events"), any(PostEvent.class));
    }

    @Test
    @DisplayName("Get comments — returns list for post")
    void getComments_ReturnsList() {
        List<Comment> comments = List.of(
                Comment.builder().id("c1").postId(POST_ID).content("Comment 1").build(),
                Comment.builder().id("c2").postId(POST_ID).content("Comment 2").build()
        );

        when(commentRepository.findByPostIdOrderByCreatedAtDesc(POST_ID)).thenReturn(comments);

        List<CommentResponse> result = postService.getComments(POST_ID);

        assertThat(result).hasSize(2);
    }

    // ── Delete Post Tests ──────────────────────────────────

    @Test
    @DisplayName("Delete post — success when user is author")
    void deletePost_SuccessWhenAuthor() throws Exception {
        when(postRepository.findById(POST_ID)).thenReturn(Optional.of(mockPost));

        postService.deletePost(POST_ID, USER_ID);

        verify(postRepository).delete(mockPost);
    }

    @Test
    @DisplayName("Delete post — fails when user is not author")
    void deletePost_FailsWhenNotAuthor() {
        when(postRepository.findById(POST_ID)).thenReturn(Optional.of(mockPost));

        assertThatThrownBy(() -> postService.deletePost(POST_ID, "other-user"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("only delete your own posts");
    }

    @Test
    @DisplayName("Get post — throws exception when not found")
    void getPost_NotFound_ThrowsException() {
        when(postRepository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.getPost("nonexistent", USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Post not found");
    }
}