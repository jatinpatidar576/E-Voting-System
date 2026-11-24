// backend.js — Local Backend Service powered by Browser LocalStorage
(function (global) {
  "use strict";

  const DB_KEYS = {
    USERS: "voteCR_users",
    SESSION: "voteCR_session",
    CANDIDATES: "voteCR_candidates",
    NOMINATIONS: "voteCR_nominations",
    VOTES: "voteCR_votes",
  };

  // Default candidates seeded on first run
  const DEFAULT_CANDIDATES = [
    {
      id: "cand_1",
      name: "Aarav Sharma",
      rollNumber: "CS2024-001",
      department: "B.Tech AI",
      manifesto: "Transparent communication between students and faculty with weekly feedback syncs.",
      photo: "",
      approved: true,
    },
    {
      id: "cand_2",
      name: "Priya Verma",
      rollNumber: "CS2024-014",
      department: "B.Tech AI",
      manifesto: "Better lab schedules, hackathon mentorship groups, and shared exam resources.",
      photo: "",
      approved: true,
    },
    {
      id: "cand_3",
      name: "Rohan Gupta",
      rollNumber: "CS2024-027",
      department: "B.Tech AI",
      manifesto: "Streamlined attendance updates, placement prep sessions, and peer study circles.",
      photo: "",
      approved: true,
    },
    {
      id: "cand_4",
      name: "Ananya Singh",
      rollNumber: "CS2024-039",
      department: "B.Tech AI",
      manifesto: "Inclusive class events, timely exam notifications, and open student grievance tracking.",
      photo: "",
      approved: true,
    },
  ];

  // ---------- Low-Level Storage Helpers ----------
  function readTable(key, fallback = []) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error(`Failed to read ${key}:`, err);
      return fallback;
    }
  }

  function writeTable(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // SHA-256 password hashing using native Web Crypto API
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(String(password));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function initDatabase() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      writeTable(DB_KEYS.USERS, []);
    }
    if (!localStorage.getItem(DB_KEYS.CANDIDATES)) {
      writeTable(DB_KEYS.CANDIDATES, DEFAULT_CANDIDATES);
    }
    if (!localStorage.getItem(DB_KEYS.NOMINATIONS)) {
      writeTable(DB_KEYS.NOMINATIONS, []);
    }
    if (!localStorage.getItem(DB_KEYS.VOTES)) {
      writeTable(DB_KEYS.VOTES, []);
    }
  }

  // ---------- API Layer ----------
  const VoteCRBackend = {
    // 1. AUTHENTICATION & USERS
    async registerStudent({ name, email, rollNumber, department = "B.Tech AI", password }) {
      const cleanName = (name || "").trim();
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanRoll = (rollNumber || "").trim().toUpperCase();

      if (!cleanName || !cleanEmail || !cleanRoll || !password) {
        return { ok: false, error: "All fields are required." };
      }
      if (password.length < 6) {
        return { ok: false, error: "Password must be at least 6 characters." };
      }

      const users = readTable(DB_KEYS.USERS);
      if (users.some((u) => u.email === cleanEmail)) {
        return { ok: false, error: "An account with this email already exists." };
      }
      if (users.some((u) => u.rollNumber === cleanRoll)) {
        return { ok: false, error: "This roll number is already registered." };
      }

      const passwordHash = await hashPassword(password);
      const newUser = {
        id: "usr_" + Date.now(),
        name: cleanName,
        email: cleanEmail,
        rollNumber: cleanRoll,
        department: department.trim() || "B.Tech AI",
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      writeTable(DB_KEYS.USERS, users);

      const safeUser = this._sanitizeUser(newUser);
      writeTable(DB_KEYS.SESSION, safeUser);
      return { ok: true, user: safeUser };
    },

    async loginStudent({ email, password }) {
      const cleanEmail = (email || "").trim().toLowerCase();
      if (!cleanEmail || !password) {
        return { ok: false, error: "Email and password are required." };
      }

      const users = readTable(DB_KEYS.USERS);
      const passwordHash = await hashPassword(password);
      const matched = users.find(
        (u) => u.email === cleanEmail && u.passwordHash === passwordHash
      );

      if (!matched) {
        return { ok: false, error: "Invalid email or password." };
      }

      const safeUser = this._sanitizeUser(matched);
      writeTable(DB_KEYS.SESSION, safeUser);
      return { ok: true, user: safeUser };
    },

getCurrentUser() {
  return (
    readTable(DB_KEYS.SESSION, null) ||
    readTable("voteCR_currentUser", null)
  );
},

logoutStudent() {
  localStorage.removeItem(DB_KEYS.SESSION);
  localStorage.removeItem("voteCR_currentUser");
  return { ok: true };
},

    _sanitizeUser(user) {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    },

    // 2. CR SELF-NOMINATION
    submitNomination({ studentId, studentName, rollNumber, department, manifesto }) {
      const user = this.getCurrentUser();
      const activeId = studentId || user?.id;
      if (!activeId) {
        return { ok: false, error: "You must be logged in to nominate yourself." };
      }

      const cleanName = (studentName || user?.name || "").trim();
      const cleanRoll = (rollNumber || user?.rollNumber || "").trim().toUpperCase();
      const cleanDept = (department || user?.department || "B.Tech AI").trim();
      const cleanManifesto = (manifesto || "").trim();

      if (!cleanName || !cleanRoll || !cleanManifesto) {
        return { ok: false, error: "Name, roll number, and manifesto are required." };
      }

      const nominations = readTable(DB_KEYS.NOMINATIONS);
      const existingIndex = nominations.findIndex((n) => n.studentId === activeId);

      const record = {
        id: existingIndex >= 0 ? nominations[existingIndex].id : "nom_" + Date.now(),
        studentId: activeId,
        studentName: cleanName,
        rollNumber: cleanRoll,
        department: cleanDept,
        manifesto: cleanManifesto,
        status: "Approved", // Auto-approved for local demo; set to "Pending" if using an admin review flow
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        nominations[existingIndex] = record;
      } else {
        nominations.push(record);
      }
      writeTable(DB_KEYS.NOMINATIONS, nominations);

      // Sync approved nomination into the active candidates table so classmates can vote for them
      this._syncNominationToCandidates(record);

      return { ok: true, nomination: record };
    },

    getMyNomination() {
      const user = this.getCurrentUser();
      if (!user) return null;
      const nominations = readTable(DB_KEYS.NOMINATIONS);
      return nominations.find((n) => n.studentId === user.id) || null;
    },

    withdrawNomination() {
      const user = this.getCurrentUser();
      if (!user) return { ok: false, error: "Not logged in." };

      const nominations = readTable(DB_KEYS.NOMINATIONS).filter(
        (n) => n.studentId !== user.id
      );
      writeTable(DB_KEYS.NOMINATIONS, nominations);

      const candidates = readTable(DB_KEYS.CANDIDATES).filter(
        (c) => c.studentId !== user.id
      );
      writeTable(DB_KEYS.CANDIDATES, candidates);

      return { ok: true };
    },

    _syncNominationToCandidates(nomination) {
      const candidates = readTable(DB_KEYS.CANDIDATES);
      const idx = candidates.findIndex((c) => c.studentId === nomination.studentId);
      const candidateObj = {
        id: idx >= 0 ? candidates[idx].id : "cand_" + nomination.studentId,
        studentId: nomination.studentId,
        name: nomination.studentName,
        rollNumber: nomination.rollNumber,
        department: nomination.department,
        manifesto: nomination.manifesto,
        photo: "",
        approved: nomination.status === "Approved",
      };

      if (idx >= 0) {
        candidates[idx] = candidateObj;
      } else {
        candidates.push(candidateObj);
      }
      writeTable(DB_KEYS.CANDIDATES, candidates);
    },

    // 3. CANDIDATES & VOTING
    getCandidates() {
      return readTable(DB_KEYS.CANDIDATES).filter((c) => c.approved !== false);
    },

    hasVoted(studentId) {
      const user = this.getCurrentUser();
      const targetId = studentId || user?.id;
      if (!targetId) return false;
      const votes = readTable(DB_KEYS.VOTES);
      return votes.some((v) => v.voterId === targetId);
    },

    getMyVote() {
      const user = this.getCurrentUser();
      if (!user) return null;
      const votes = readTable(DB_KEYS.VOTES);
      return votes.find((v) => v.voterId === user.id) || null;
    },

    castVote(candidateId) {
      const user = this.getCurrentUser();
      if (!user) {
        return { ok: false, error: "Please log in before casting a vote." };
      }
      if (this.hasVoted(user.id)) {
        return { ok: false, error: "You have already cast your vote." };
      }

      const candidates = this.getCandidates();
      const targetCandidate = candidates.find((c) => c.id === candidateId);
      if (!targetCandidate) {
        return { ok: false, error: "Selected candidate does not exist." };
      }

      const votes = readTable(DB_KEYS.VOTES);
      const voteRecord = {
        id: "vote_" + Date.now(),
        voterId: user.id,
        voterRoll: user.rollNumber,
        candidateId: targetCandidate.id,
        castAt: new Date().toISOString(),
      };

      votes.push(voteRecord);
      writeTable(DB_KEYS.VOTES, votes);

      return { ok: true, vote: voteRecord };
    },

    // 4. LIVE RESULTS & OVERVIEW STATS
    getResults() {
      const candidates = this.getCandidates();
      const votes = readTable(DB_KEYS.VOTES);
      const totalVotes = votes.length;

      const standings = candidates
        .map((cand) => {
          const count = votes.filter((v) => v.candidateId === cand.id).length;
          const percentage =
            totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;
          return {
            ...cand,
            votes: count,
            percentage,
          };
        })
        .sort((a, b) => b.votes - a.votes);

      return {
        totalVotes,
        totalCandidates: candidates.length,
        leader: totalVotes > 0 ? standings[0] : null,
        standings,
      };
    },

    // Utility to reset local data during testing
    resetDemoData() {
      Object.values(DB_KEYS).forEach((k) => localStorage.removeItem(k));
      initDatabase();
    },
  };

  initDatabase();
  global.VoteCRBackend = VoteCRBackend;
})(window);