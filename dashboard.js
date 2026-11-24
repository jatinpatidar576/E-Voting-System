/**
 * Class Representative (CR) Voting System - Dashboard Logic
 */

// ==========================================
// 1. AUTHENTICATION GUARD
// ==========================================

// ==========================================
// 1. AUTHENTICATION GUARD
// ==========================================

const currentUser = VoteCRBackend.getCurrentUser();

if (!currentUser) {
    window.location.replace('./index.html');
}

function logout() {
    VoteCRBackend.logoutStudent();
    window.location.replace('./index.html');
}

window.logout = logout;

// ==========================================
// 2. STATE MANAGEMENT WITH LOCALSTORAGE
// ==========================================
const defaultCandidates = [
  {
    id: 1,
    name: 'Alex Vance',
    dept: 'Computer Science',
    votes: 0,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    manifesto: 'Focusing on lab equipment upgrades, peer tutoring networks, and transparent communication.'
  },
  {
    id: 2,
    name: 'Sophia Martinez',
    dept: 'Business Administration',
    votes: 0,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    manifesto: 'Building stronger industry connections, career fair workshops, and campus event organizing.'
  },
  {
    id: 3,
    name: 'Elena Rostova',
    dept: 'Electrical Engineering',
    votes: 0,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    manifesto: 'Promoting inter-departmental projects, technical hackathons, and sustainable campus initiatives.'
  },
  {
    id: 4,
    name: 'Marcus Chen',
    dept: 'Mechanical Engineering',
    votes: 0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    manifesto: 'Focusing on student sports events, workshop safety, and better study room reservations.'
  }
];

function loadVotes() {
  const savedVotes = JSON.parse(localStorage.getItem('voteCR_votes') || '{}');
  return defaultCandidates.map(c => ({
    ...c,
    votes: savedVotes[c.id] || 0
  }));
}

function getVotedUsers() {
  return JSON.parse(localStorage.getItem('voteCR_votedUsers') || '{}');
}

const votedUsersMap = getVotedUsers();
const userVoteRecord = currentUser ? votedUsersMap[currentUser.email] : null;

const appState = {
  activeTab: 'overview',
voter: {
    name: currentUser ? currentUser.name : 'Student',
    email: currentUser ? currentUser.email : '',
    roll: currentUser ? currentUser.rollNumber : '',
    hasVoted: Boolean(userVoteRecord),
    votedCandidateId: userVoteRecord || null
  },
  candidates: loadVotes()
};

// ==========================================
// 3. DOM ELEMENTS
// ==========================================
const navItems = document.querySelectorAll('.nav-item');
const tabPages = document.querySelectorAll('.tab-page');
const tabTitleElement = document.getElementById('tab-title');
const statusBadgeElement = document.getElementById('voting-status-badge');

const totalBallotsElement = document.getElementById('total-ballots');
const totalCandidatesElement = document.getElementById('total-candidates');
const leaderNameElement = document.getElementById('leader-name');
const leaderVotesElement = document.getElementById('leader-votes');

const leaderboardContainer = document.getElementById('leaderboard-container');
const candidatesGridContainer = document.getElementById('candidates-grid-container');
const votingOptionsContainer = document.getElementById('voting-options');
const detailedResultsContainer = document.getElementById('detailed-results-container');

const voteForm = document.getElementById('vote-form');
const submitVoteBtn = document.getElementById('submit-vote-btn');
const logoutBtn = document.getElementById('logout-btn');

// ==========================================
// 4. TAB NAVIGATION SYSTEM
// ==========================================
function switchTab(targetTabId) {
  appState.activeTab = targetTabId;

  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === targetTabId);
  });

  tabPages.forEach(page => {
    page.classList.toggle('active', page.id === `tab-${targetTabId}`);
  });

  const formattedTitle = targetTabId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (tabTitleElement) {
    tabTitleElement.textContent = formattedTitle === 'Vote' ? 'Cast Vote' : formattedTitle;
  }
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(item.getAttribute('data-tab'));
  });
});

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

window.switchTab = switchTab;

// ==========================================
// 5. CALCULATIONS & RENDERERS
// ==========================================
function getTotalVotes() {
  return appState.candidates.reduce((sum, c) => sum + c.votes, 0);
}

function getLeader() {
  const sorted = [...appState.candidates].sort((a, b) => b.votes - a.votes);
  if (sorted[0].votes === 0) return { name: 'None', votes: 0 };
  return sorted[0];
}

function renderUserProfile() {
  const sidebarName = document.getElementById('sidebar-user-name');
  const sidebarRoll = document.getElementById('sidebar-user-roll');
  const profileName = document.getElementById('profile-name');
  const profileRoll = document.getElementById('profile-roll');
  const profileEmail = document.getElementById('profile-email');
  const profileStatus = document.getElementById('profile-voting-status');

  if (sidebarName) sidebarName.textContent = appState.voter.name;
  if (sidebarRoll) sidebarRoll.textContent = `ID: ${appState.voter.roll}`;
  if (profileName) profileName.textContent = appState.voter.name;
  if (profileRoll) profileRoll.textContent = appState.voter.roll;
  if (profileEmail) profileEmail.textContent = appState.voter.email;

  if (profileStatus) {
    profileStatus.textContent = appState.voter.hasVoted
      ? 'Ballot Cast (Verified)'
      : 'Ballot Unlocked (Not Cast Yet)';
  }
}

function renderMetrics() {
  const totalVotes = getTotalVotes();
  const leader = getLeader();

  if (totalBallotsElement) totalBallotsElement.textContent = totalVotes;
  if (totalCandidatesElement) totalCandidatesElement.textContent = appState.candidates.length;
  if (leaderNameElement) leaderNameElement.textContent = leader.name.split(' ')[0];
  if (leaderVotesElement) leaderVotesElement.textContent = `${leader.votes} votes`;
}

function renderLeaderboard() {
  if (!leaderboardContainer) return;

  const totalVotes = getTotalVotes();
  const sortedCandidates = [...appState.candidates]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);

  leaderboardContainer.innerHTML = sortedCandidates.map((candidate, index) => {
    const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
    return `
      <div class="leader-item">
        <span class="rank">#${index + 1}</span>
        <img src="${candidate.avatar}" alt="${candidate.name}" class="candidate-avatar" />
        <div class="candidate-meta">
          <div class="candidate-name">${candidate.name}</div>
          <div class="candidate-dept">${candidate.dept}</div>
        </div>
        <div class="percentage">${percentage}%</div>
      </div>
    `;
  }).join('');
}

function renderCandidatesGrid() {
  if (!candidatesGridContainer) return;

  candidatesGridContainer.innerHTML = appState.candidates.map(candidate => `
    <div class="candidate-card">
      <img src="${candidate.avatar}" alt="${candidate.name}" class="candidate-photo" />
      <div class="candidate-details">
        <h3>${candidate.name}</h3>
        <span class="badge">${candidate.dept}</span>
        <p class="manifesto">"${candidate.manifesto}"</p>
      </div>
    </div>
  `).join('');
}

function renderVotingOptions() {
  if (!votingOptionsContainer) return;

  if (appState.voter.hasVoted) {
    const votedCandidate = appState.candidates.find(c => c.id === appState.voter.votedCandidateId);
    votingOptionsContainer.innerHTML = `
      <div class="success-vote-message" style="padding: 20px; background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; color: #065f46;">
        <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
        <strong>You have successfully cast your ballot!</strong>
        <p style="margin-top: 4px; font-size: 0.9rem;">You voted for <strong>${votedCandidate ? votedCandidate.name : 'your selected candidate'}</strong>. Official results update dynamically.</p>
      </div>
    `;
    if (submitVoteBtn) submitVoteBtn.style.display = 'none';
    return;
  }

  if (submitVoteBtn) submitVoteBtn.style.display = 'inline-flex';
  votingOptionsContainer.innerHTML = appState.candidates.map(candidate => `
    <label class="vote-option">
      <input type="radio" name="cr_candidate" value="${candidate.id}" required />
      <div class="option-content">
        <img src="${candidate.avatar}" class="candidate-avatar" alt="${candidate.name}" />
        <div class="meta">
          <strong>${candidate.name}</strong>
          <span>${candidate.dept}</span>
        </div>
        <i class="fa-solid fa-circle-check check-icon"></i>
      </div>
    </label>
  `).join('');
}

function renderLiveResults() {
  if (!detailedResultsContainer) return;

  const totalVotes = getTotalVotes();

  detailedResultsContainer.innerHTML = appState.candidates.map(candidate => {
    const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
    return `
      <div class="result-bar-item">
        <div class="result-info">
          <span class="candidate-name">${candidate.name} (${candidate.dept})</span>
          <span class="vote-count">${candidate.votes} votes (${percentage}%)</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function updateVoterBadge() {
  if (!statusBadgeElement) return;
  const firstName = appState.voter.name.split(' ')[0];

  if (appState.voter.hasVoted) {
    statusBadgeElement.style.backgroundColor = '#eff6ff';
    statusBadgeElement.style.borderColor = '#2563eb';
    statusBadgeElement.style.color = '#2563eb';
    statusBadgeElement.innerHTML = `
      <i class="fa-solid fa-check-double"></i>
      <span>Welcome, ${firstName} — Ballot Submitted</span>
    `;
  } else {
    statusBadgeElement.innerHTML = `
      <i class="fa-solid fa-circle-check"></i>
      <span>Welcome, ${firstName} — Ballot Unlocked</span>
    `;
  }
}

function renderApp() {
  renderUserProfile();
  renderMetrics();
  renderLeaderboard();
  renderCandidatesGrid();
  renderVotingOptions();
  renderLiveResults();
  updateVoterBadge();
}

// ==========================================
// 6. BALLOT SUBMISSION LOGIC
// ==========================================
if (voteForm) {
  voteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (appState.voter.hasVoted) return;

    const selectedOption = voteForm.querySelector('input[name="cr_candidate"]:checked');
    if (!selectedOption) {
      alert('Please select a candidate before submitting.');
      return;
    }

    const selectedCandidateId = parseInt(selectedOption.value, 10);
    const candidate = appState.candidates.find(c => c.id === selectedCandidateId);

    if (candidate) {
      candidate.votes += 1;
      appState.voter.hasVoted = true;
      appState.voter.votedCandidateId = selectedCandidateId;

      // Persist votes and voter status in localStorage
      const votesToSave = {};
      appState.candidates.forEach(c => { votesToSave[c.id] = c.votes; });
      localStorage.setItem('voteCR_votes', JSON.stringify(votesToSave));

      const updatedVotedUsers = getVotedUsers();
      updatedVotedUsers[appState.voter.email] = selectedCandidateId;
      localStorage.setItem('voteCR_votedUsers', JSON.stringify(updatedVotedUsers));

      renderApp();
      alert(`Success! Your vote for ${candidate.name} has been officially registered.`);
      switchTab('live-results');
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = VoteCRBackend.getCurrentUser();
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  const modal = document.getElementById("crNominationModal");
  const openBtn = document.getElementById("openNominationModalBtn");
  const closeBtn = document.getElementById("closeNominationModalBtn");
  const cancelBtn = document.getElementById("cancelNominationBtn");
  const editBtn = document.getElementById("editNominationBtn");
  const withdrawBtn = document.getElementById("withdrawNominationBtn");
  const form = document.getElementById("crNominationForm");

  const promptState = document.getElementById("nominationPromptState");
  const submittedState = document.getElementById("nominationSubmittedState");
  const submittedSummary = document.getElementById("submittedSummaryText");
  const statusBadge = document.getElementById("nominationStatusBadge");

  const nameInput = document.getElementById("crStudentName");
  const rollInput = document.getElementById("crRollNumber");
  const sectionInput = document.getElementById("crSection");
  const manifestoInput = document.getElementById("crManifesto");
  const charCount = document.getElementById("manifestoCharCount");
  const confirmCheckbox = document.getElementById("crConfirmEligibility");

  function renderNominationState() {
    const nomination = VoteCRBackend.getMyNomination();

    if (nomination) {
      promptState?.classList.add("hidden");
      submittedState?.classList.remove("hidden");
      if (statusBadge) {
        statusBadge.textContent = "Nominated";
        statusBadge.className = "badge badge-success";
      }
      if (submittedSummary) {
        submittedSummary.textContent = `${nomination.studentName} (${nomination.rollNumber}) • ${nomination.department} — "${nomination.manifesto}"`;
      }
    } else {
      promptState?.classList.remove("hidden");
      submittedState?.classList.add("hidden");
      if (statusBadge) {
        statusBadge.textContent = "Nominations Open";
        statusBadge.className = "badge badge-info";
      }
    }
  }

  function openModal(prefillData = null) {
    if (!modal) return;
    nameInput.value = prefillData?.studentName || currentUser.name || "";
    rollInput.value = prefillData?.rollNumber || currentUser.rollNumber || "";
    sectionInput.value = prefillData?.department || currentUser.department || "";
    manifestoInput.value = prefillData?.manifesto || "";
    confirmCheckbox.checked = Boolean(prefillData);
    if (charCount) charCount.textContent = String(manifestoInput.value.length);

    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal?.classList.add("hidden");
  }

  manifestoInput?.addEventListener("input", () => {
    if (charCount) charCount.textContent = String(manifestoInput.value.length);
  });

  openBtn?.addEventListener("click", () => openModal(null));
  editBtn?.addEventListener("click", () => openModal(VoteCRBackend.getMyNomination()));
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  withdrawBtn?.addEventListener("click", () => {
    VoteCRBackend.withdrawNomination();
    renderNominationState();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nomResult = VoteCRBackend.submitNomination({
      studentId: currentUser.id,
      studentName: nameInput.value.trim(),
      rollNumber: rollInput.value.trim(),
      department: sectionInput.value.trim(),
      manifesto: manifestoInput.value.trim(),
    });

    if (!nomResult.ok) {
      alert(nomResult.error);
      return;
    }

    renderNominationState();
    closeModal();
  });

  renderNominationState();
});