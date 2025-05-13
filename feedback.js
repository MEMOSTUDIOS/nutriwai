// Implementation example with vanilla JavaScript
// Save this as feedback.js

document.addEventListener('DOMContentLoaded', function() {
  const feedbackContainers = document.querySelectorAll('[data-feedback-container]');
  
  feedbackContainers.forEach(container => {
    const id = container.getAttribute('data-feedback-id') || 'default';
    
    // Create the HTML structure
    container.innerHTML = `
      <div class="feedback-container">
        <div class="feedback-buttons">
          <button class="feedback-button" id="like-button-${id}">
            <svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <span class="feedback-count" id="likes-count-${id}">0</span>
          </button>
          
          <button class="feedback-button" id="dislike-button-${id}">
            <svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
            </svg>
            <span class="feedback-count" id="dislikes-count-${id}">0</span>
          </button>
        </div>
        <div class="feedback-thanks" id="feedback-thanks-${id}" style="display: none;">
          Thank you for your feedback!
        </div>
      </div>
    `;
    
    // Get DOM elements
    const likeButton = document.getElementById(`like-button-${id}`);
    const dislikeButton = document.getElementById(`dislike-button-${id}`);
    const likesCount = document.getElementById(`likes-count-${id}`);
    const dislikesCount = document.getElementById(`dislikes-count-${id}`);
    const thanksMessage = document.getElementById(`feedback-thanks-${id}`);
    
    // Initialize state from localStorage
    let likes = localStorage.getItem(`feedbackLikes_${id}`);
    likes = likes !== null ? parseInt(likes) : 0;
    
    let dislikes = localStorage.getItem(`feedbackDislikes_${id}`);
    dislikes = dislikes !== null ? parseInt(dislikes) : 0;
    
    let userVote = localStorage.getItem(`userVote_${id}`) || null;
    
    // Update display
    likesCount.textContent = likes;
    dislikesCount.textContent = dislikes;
    
    if (userVote === 'like') {
      likeButton.classList.add('feedback-liked');
      thanksMessage.style.display = 'block';
    } else if (userVote === 'dislike') {
      dislikeButton.classList.add('feedback-disliked');
      thanksMessage.style.display = 'block';
    }
    
    // Event handlers
    likeButton.addEventListener('click', function() {
      if (userVote === 'like') {
        // Remove like
        likes--;
        userVote = null;
        likeButton.classList.remove('feedback-liked');
        thanksMessage.style.display = 'none';
      } else {
        // Add like
        likes++;
        if (userVote === 'dislike') {
          // Remove previous dislike
          dislikes--;
          dislikeButton.classList.remove('feedback-disliked');
        }
        userVote = 'like';
        likeButton.classList.add('feedback-liked');
        thanksMessage.style.display = 'block';
      }
      
      // Update display and storage
      likesCount.textContent = likes;
      dislikesCount.textContent = dislikes;
      localStorage.setItem(`feedbackLikes_${id}`, likes.toString());
      localStorage.setItem(`feedbackDislikes_${id}`, dislikes.toString());
      localStorage.setItem(`userVote_${id}`, userVote || '');
    });
    
    dislikeButton.addEventListener('click', function() {
      if (userVote === 'dislike') {
        // Remove dislike
        dislikes--;
        userVote = null;
        dislikeButton.classList.remove('feedback-disliked');
        thanksMessage.style.display = 'none';
      } else {
        // Add dislike
        dislikes++;
        if (userVote === 'like') {
          // Remove previous like
          likes--;
          likeButton.classList.remove('feedback-liked');
        }
        userVote = 'dislike';
        dislikeButton.classList.add('feedback-disliked');
        thanksMessage.style.display = 'block';
      }
      
      // Update display and storage
      likesCount.textContent = likes;
      dislikesCount.textContent = dislikes;
      localStorage.setItem(`feedbackLikes_${id}`, likes.toString());
      localStorage.setItem(`feedbackDislikes_${id}`, dislikes.toString());
      localStorage.setItem(`userVote_${id}`, userVote || '');
    });
  });
});