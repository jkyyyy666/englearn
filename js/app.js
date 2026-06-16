// ========== 鑻辫\u5b66\u4e60 App - 涓婚€昏緫 ==========

let currentPage = "home";
let currentWords = [];
let studyWords = [];
let studyIndex = 0;
let quizWords = [];
let quizIndex = 0;
let quizCorrect = 0;
let isFlipped = false;

document.addEventListener("DOMContentLoaded", function() {
  initTabs();
  initSearch();
  initAddWord();
  showPage("home");
  loadHomePage();
  
  // 浜嬩欢濮旀墭
  document.getElementById("word-list").addEventListener("click", function(e) {
    const item = e.target.closest(".word-item");
    if (item) showWordDetail(parseInt(item.dataset.index));
    
    const favBtn = e.target.closest(".btn-fav");
    if (favBtn) {
      e.stopPropagation();
      toggleFavWord(favBtn.dataset.wid);
    }
  });
  
    document.querySelectorAll("#page-study .level-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      if (this.dataset.study === "sentence") {
        initSentenceMode();
        return;
      }
      document.querySelectorAll("#page-study .level-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      initStudy(this.dataset.study);
    });
  });
  
    // Chinese level buttons
  document.querySelectorAll("#page-chinese .level-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      initChineseStudy(this.dataset.clvl);
    });
  });
  
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
});

// ========== Tab ==========
function initTabs() {
  document.querySelectorAll(".tab-item").forEach(tab => {
    tab.addEventListener("click", function() {
      const page = this.dataset.page;
      document.querySelectorAll(".tab-item").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      showPage(page);
    });
  });
}

function showPage(page) {
  currentPage = page;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById("page-" + page);
  if (el) el.classList.add("active");
  // Sync tab bar
  document.querySelectorAll(".tab-item").forEach(t => {
    t.classList.toggle("active", t.dataset.page === page);
  });
  
  switch(page) {
    case "home": loadHomePage(); break;
    case "words": loadWordList(); break;
    case "study": initStudy("all"); break;
    case "quiz": initQuiz(); break;
    case "chinese": initChineseStudy("all"); break;
    case "settings": loadSettings(); break;
  }
}

// ========== Home ==========
function loadHomePage() {
  const allWords = getAllWords();
  const progress = getProgress();
  const favorites = getFavorites();
  
  const learned = Object.keys(progress).filter(id => {
    const p = progress[id];
    return p.attempts > 0 && p.correct / p.attempts >= 0.8;
  }).length;
  
  const mastered = Object.keys(progress).filter(id => {
    const p = progress[id];
    return p.attempts >= 3 && p.correct / p.attempts >= 0.9;
  }).length;
  
  document.getElementById("stat-total").textContent = allWords.length;
  document.getElementById("stat-learned").textContent = learned;
  document.getElementById("stat-mastered").textContent = mastered;
  document.getElementById("stat-favorites").textContent = favorites.length;
  
  const today = new Date().toDateString();
  const todayStudied = Object.keys(progress).filter(id => {
    const p = progress[id];
    return p.lastReviewed && new Date(p.lastReviewed).toDateString() === today;
  }).length;
  
  const goal = parseInt(localStorage.getItem("english_daily_goal") || "10");
  document.getElementById("daily-progress-text").textContent = todayStudied + " / " + goal;
  document.getElementById("daily-progress-bar").style.width = Math.min(todayStudied / goal * 100, 100) + "%";
}

// ========== Word List ==========
function loadWordList(query) {
  const all = getAllWords();
  const progress = getProgress();
  const favorites = getFavorites();
  const search = (query || document.getElementById("word-search").value || "").toLowerCase();
  
  const activeLevel = document.querySelector(".level-btn.active");
  const level = activeLevel ? parseInt(activeLevel.dataset.level) : 0;
  
  let filtered = all;
  if (level > 0) filtered = filtered.filter(w => w.level === level);
  if (search) filtered = filtered.filter(w => 
    w.word.toLowerCase().includes(search) || w.meaning.includes(search));
  
  if (filtered.length === 0) {
    document.getElementById("word-list").innerHTML = '<div class="empty-state"><div class="empty-icon">馃攳</div><div class="empty-text">娌℃湁鎵惧埌鍖归厤鐨勫崟璇?/div></div>';
    return;
  }
  
  const levelNames = ["", "猸?鍩虹", "猸愨瓙 甯哥敤", "猸愨瓙猸?杩涢樁"];
  
  document.getElementById("word-list").innerHTML = filtered.map((w, i) => {
    const wid = w.id || "w" + Date.now() + i;
    const p = progress[wid];
    const acc = p && p.attempts > 0 ? Math.round(p.correct / p.attempts * 100) : 0;
    const fav = favorites.includes(wid);
    const idx = all.indexOf(w);
    const color = acc >= 80 ? "#4CAF50" : acc >= 50 ? "#FF9800" : "#F44336";
    
    return '<div class="word-item" data-index="' + idx + '">' +
      '<div class="word-main"><div>' +
        '<div class="word-text">' + w.word + '</div>' +
        (w.phonetic ? '<div class="word-phonetic">' + w.phonetic + '</div>' : '') +
      '</div><div style="text-align:right">' +
        '<div class="word-meaning">' + w.meaning + '</div>' +
        (p ? '<div style="font-size:11px;color:' + color + ';margin-top:2px">正确率' + acc + '%</div>' : '') +
      '</div></div>' +
      '<div class="word-level">' + (levelNames[w.level] || "") + '</div>' +
      '<div class="word-actions">' +
        '<button class="btn-sm btn-fav' + (fav ? " active" : "") + '" data-wid="' + wid + '">' + (fav ? "★已收藏" : "☆收藏") + '</button>' +
      '</div></div>';
  }).join("");
}

function initSearch() {
  document.getElementById("word-search").addEventListener("input", function() {
    loadWordList(this.value);
  });
  document.querySelectorAll("#page-words .level-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll("#page-words .level-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      loadWordList();
    });
  });
}

function toggleFavWord(wid) {
  toggleFavorite(wid);
  loadWordList();
  showToast("已更新收藏");
}

function showWordDetail(index) {
  const all = getAllWords();
  const w = all[index];
  const wid = w.id || "w" + index;
  const fav = getFavorites().includes(wid);
  
  var html = '<div style="text-align:center;padding:20px 0">' +
    '<div style="font-size:36px;font-weight:700;margin-bottom:8px">' + w.word + '</div>' +
    (w.phonetic ? '<div style="font-size:16px;color:var(--text-secondary);margin-bottom:12px">' + w.phonetic + '</div>' : "") +
    '<div style="font-size:24px;color:var(--primary);font-weight:600;margin-bottom:16px">' + w.meaning + '</div>' +
    (w.example ? '<div style="font-size:15px;color:var(--text-secondary);font-style:italic;margin-bottom:20px">"' + w.example + '"</div>' : "") +
    '<button class="btn-primary" style="width:auto;padding:0 32px;display:inline-block" onclick="window._toggleFav(\'' + wid + '\')">' +
    (fav ? "★取消收藏" : "★加入收藏") + '</button></div>';
  
  document.getElementById("modal-overlay").classList.add("show");
  document.getElementById("modal-overlay").innerHTML = '<div class="modal-content"><h2>\u5355\u8bcd\u8be6\u60c5</h2>' + html + '<button class="btn-secondary" onclick="closeModal()">\u5173\u95ed</button></div>';
}

window._toggleFav = function(id) {
  toggleFavorite(id);
  closeModal();
  showToast("已更新收藏");
};

// ========== Flashcards ==========
function initStudy(mode) {
  mode = mode || "all";
  const all = getAllWords();
  const progress = getProgress();
  const favorites = getFavorites();
  
  let pool = (mode === "favorites") ? all.filter(w => favorites.includes(w.id)) : all;
  pool = pool.sort((a, b) => {
    const pa = progress[a.id] || { attempts: 0, correct: 0 };
    const pb = progress[b.id] || { attempts: 0, correct: 0 };
    return (pa.attempts > 0 ? pa.correct / pa.attempts : 0) - (pb.attempts > 0 ? pb.correct / pb.attempts : 0);
  });
  
  if (pool.length === 0) {
    document.getElementById("flashcard-area").innerHTML = '<div class="empty-state"><div class="empty-icon">馃摎</div><div class="empty-text">鏆傛棤寰呭涔犵殑鍗曡瘝</div></div>';
    document.getElementById("flashcard-controls").innerHTML = "";
    return;
  }
  
  studyWords = pool;
  studyIndex = 0;
  renderFlashcard();
}

function renderFlashcard() {
  if (studyIndex >= studyWords.length) {
    document.getElementById("flashcard-area").innerHTML = '<div class="quiz-result"><div style="font-size:48px;margin-bottom:12px">\ud83c\udf89</div><div class="score">\u5b8c\u6210\uff1a</div><div class="score-label">\u672c\u6b21\u5b66\u4e60\u4e86?' + studyWords.length + ' \u4e2a\u5355\u8bcd</div><button class="btn-primary" onclick="initStudy(document.querySelector(\'.level-btn.active[data-study]\')?.dataset?.study || \'all\')" style="margin-top:16px">\u518d\u6765\u4e00\u8f6e</button></div>';
    document.getElementById("flashcard-controls").innerHTML = "";
    return;
  }
  
  isFlipped = false;
  const w = studyWords[studyIndex];
  const total = studyWords.length;
  
  document.getElementById("flashcard-area").innerHTML =
    '<div class="flashcard" id="flashcard" onclick="flipCard()">' +
      '<div class="flashcard-face">' +
        '<div class="fc-word">' + w.word + '</div>' +
        (w.phonetic ? '<div class="fc-phonetic">' + w.phonetic + '</div>' : "") +
        '<div class="fc-hint">👆 \u70b9\u51fb\u7ffb\u8f6c</div>' +
      '</div>' +
      '<div class="flashcard-face flashcard-back">' +
        '<div class="fc-word" style="font-size:28px">' + w.word + '</div>' +
        '<div class="fc-meaning">' + w.meaning + '</div>' +
        (w.example ? '<div class="fc-example">"' + w.example + '"</div>' : "") +
        '<div style="margin-top:12px;font-size:12px;color:#999">' + (studyIndex + 1) + ' / ' + total + '</div>' +
      '</div></div>';
  
  document.getElementById("flashcard-controls").innerHTML =
    '<div style="display:flex;gap:16px;justify-content:center">' +
      '<button class="fc-btn fc-btn-dont" onclick="rateWord(false)">\u274c</button>' +
      '<button class="fc-btn fc-btn-skip" onclick="skipWord()">🔔 </button>' +
      '<button class="fc-btn fc-btn-know" onclick="rateWord(true)">\u2705</button>' +
    '</div>';
}

function flipCard() {
  isFlipped = !isFlipped;
  const card = document.getElementById("flashcard");
  if (card) card.classList.toggle("flipped", isFlipped);
}

function rateWord(know) {
  const w = studyWords[studyIndex];
  saveProgress(w.id, know);
  studyIndex++;
  renderFlashcard();
}

function skipWord() {
  studyIndex++;
  renderFlashcard();
}


// ========== Sentence Fill Mode ==========
let sentenceWords = [];
let sentenceIndex = 0;
let sentenceCorrect = 0;
let sentenceAnswered = false;

function initSentenceMode() {
  document.querySelectorAll("#page-study .level-btn").forEach(b => b.classList.remove("active"));
  document.querySelector("#page-study .level-btn[data-study='sentence']")?.classList.add("active");
  const all = getAllWords();
  sentenceWords = all.filter(w => {
    if (!w.example) return false;
    return w.example.toLowerCase().includes(w.word.toLowerCase());
  });
  if (sentenceWords.length === 0) {
    document.getElementById("flashcard-area").innerHTML = '<div class="empty-state"><div class="empty-icon">馃摑</div><div class="empty-text">鏆傛棤閫傚悎濉┖鐨勪緥鍙?/div></div>';
    document.getElementById("flashcard-controls").innerHTML = "";
    return;
  }
  sentenceWords = sentenceWords.sort(() => Math.random() - 0.5);
  sentenceIndex = 0;
  sentenceCorrect = 0;
  sentenceAnswered = false;
  renderSentence();
}


function highlightCnWord(cnSentence, cnMeaning) {
  if (!cnMeaning || !cnSentence) return cnSentence || '';
  // Try each meaning part separated by ；or ;
  var parts = cnMeaning.split(/[；;]/);
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (!p) continue;
    // Try to find the meaning in the cn sentence
    var idx = cnSentence.indexOf(p);
    if (idx >= 0) {
      return cnSentence.substring(0, idx) + '<span class="cn-highlight">' + p + '</span>' + cnSentence.substring(idx + p.length);
    }
  }
  // If not found, try matching individual characters from each part
  for (var j = 0; j < parts.length; j++) {
    var p3 = parts[j].trim();
    if (!p3) continue;
    for (var k = 0; k < p3.length; k++) {
      var ch = p3.charAt(k);
      if (ch === ' ' || ch === '') continue;
      var idx3 = cnSentence.indexOf(ch);
      if (idx3 >= 0) {
        return cnSentence.substring(0, idx3) + '<span class="cn-highlight">' + ch + '</span>' + cnSentence.substring(idx3 + ch.length);
      }
    }
  }
  // Last resort: append highlighted meaning at the end
  return cnSentence + ' <span class="cn-highlight">[' + parts.join('/') + ']</span>';
}

function renderSentence() {
  if (sentenceIndex >= sentenceWords.length) {
    const pct = Math.round(sentenceCorrect / sentenceWords.length * 100);
    document.getElementById("flashcard-area").innerHTML =
      '<div class="quiz-result"><div style="font-size:48px;margin-bottom:12px">\ud83c\udf89</div><div class="score">' + sentenceCorrect + " / " + sentenceWords.length + '</div><div class="score-label">正确率' + pct + '%</div><button class="btn-primary" onclick="initSentenceMode()" style="margin-top:16px">\u518d\u6765\u4e00\u8f6e</button><button class="btn-secondary" onclick="initStudy(&#39;all&#39;)">\u8fd4\u56de\u5b66\u4e60\u6a21\u5f0f</button></div>';
    document.getElementById("flashcard-controls").innerHTML = "";
    return;
  }
  const w = sentenceWords[sentenceIndex];
  const total = sentenceWords.length;
  const escWord = w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordRe = new RegExp("\\b" + escWord, "i");
  let sentenceDisplay = w.example.replace(wordRe, "____");
  document.getElementById("flashcard-area").innerHTML =
    '<div class="sentence-card">' +
      '<div class="sentence-text">' + sentenceDisplay + '</div>' +
      (w.cn ? '<div class="sentence-cn">📗  ' + highlightCnWord(w.cn, w.meaning) + '</div>' : '<div class="sentence-cn">📗  (鏆傛棤涓枃渚嬪彞缈昏瘧) 璇ヨ瘝鍚箟: ' + w.meaning + '</div>') +

      '<div class="sentence-input-area">' +
        '<input type="text" id="sentence-input" placeholder="杈撳叆鑻辨枃鍗曡瘝..." autocomplete="off">' +
        '<button class="sentence-btn sentence-btn-primary" id="sentence-submit" onclick="checkSentenceAnswer()">确认</button>' +
      '</div>' +
      '<div class="sentence-feedback" id="sentence-feedback"></div>' +
      '<div class="sentence-progress">' + (sentenceIndex + 1) + ' / ' + total + '</div>' +
    '</div>';
  document.getElementById("flashcard-controls").innerHTML = "";
  sentenceAnswered = false;
  const input = document.getElementById("sentence-input");
  if (input) {
    input.focus();
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter" && !sentenceAnswered) checkSentenceAnswer();
      else if (e.key === "Enter" && sentenceAnswered) nextSentence();
    });
  }
}

function checkSentenceAnswer() {
  if (sentenceAnswered) return;
  const w = sentenceWords[sentenceIndex];
  const input = document.getElementById("sentence-input");
  const feedback = document.getElementById("sentence-feedback");
  if (!input || !feedback) return;
  const isCorrect = input.value.trim().toLowerCase() === w.word.toLowerCase();
  if (isCorrect) {
    sentenceCorrect++;
    input.classList.add("correct");
    feedback.className = "sentence-feedback show correct";
    feedback.innerHTML = "✅ 正确！";
  } else {
    input.classList.add("wrong");
    feedback.className = "sentence-feedback show wrong";
    feedback.innerHTML = "❌ 不正确<br><span class=\"answer-reveal\">正确答案: " + w.word + "</span>";
  }
  sentenceAnswered = true;
  const submitBtn = document.getElementById("sentence-submit");
  if (submitBtn) {
    submitBtn.textContent = "下一个 →";
    submitBtn.className = "sentence-btn sentence-btn-secondary";
    submitBtn.onclick = nextSentence;
  }
  const escWord = w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordRe = new RegExp("\\b" + escWord + "\\b", "i");
  const textEl = document.querySelector(".sentence-text");
  if (textEl) {
    textEl.innerHTML = w.example.replace(wordRe, "<span class=\"sentence-blank filled\">" + w.word + "</span>");
  }
  saveProgress(w.id, isCorrect);
}

function nextSentence() {
  sentenceIndex++;
  sentenceAnswered = false;
  renderSentence();
}



// ========== Chinese Learning ==========
let chineseWords = [];
let chineseKnown = [];
let chineseUnknown = [];
let chineseIndex = 0;
let chineseFlipped = false;

function initChineseStudy(level) {
  level = level || "all";
  document.querySelectorAll("#page-chinese .level-btn").forEach(function(b) {
    b.classList.remove("active");
  });
  var activeBtn = document.querySelector("#page-chinese .level-btn[data-clvl='" + level + "']");
  if (activeBtn) activeBtn.classList.add("active");
  
  var pool = CHINESE_VOCAB;
  
  if (pool.length === 0) {
    document.getElementById("chinese-card-area").innerHTML = '<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-text">\u6682\u65e0\u4e2d\u6587\u8bcd\u6c47</div></div>';
    document.getElementById("chinese-card-controls").innerHTML = "";
    return;
  }
  
  chineseWords = pool.sort(function() { return Math.random() - 0.5; });
  chineseIndex = 0;
  chineseFlipped = false;
  chineseKnown = [];
  chineseUnknown = [];
  renderChineseCard();
}

function renderChineseCard() {
  if (chineseIndex >= chineseWords.length) {
    document.getElementById("chinese-card-area").innerHTML = '<div class="quiz-result"><div style="font-size:48px;margin-bottom:12px">\ud83c\udf89</div><div class="score">\u5b8c\u6210\uff1a</div><div class="score-label">\u672c\u6b21\u5b66\u4e60\u4e86?' + chineseWords.length + ' \u4e2a\u4e2d\u6587\u8bcd\u6c47</div><button class="btn-primary" onclick="initChineseStudy(document.querySelector(\'.level-btn.active[data-clvl]\')?.dataset?.clvl || \'all\')" style="margin-top:16px">\u518d\u6765\u4e00\u8f6e</button></div>';
    document.getElementById("chinese-card-controls").innerHTML = "";
    return;
  }
  
  chineseFlipped = false;
  var w = chineseWords[chineseIndex];
  var total = chineseWords.length;
  
  document.getElementById("chinese-card-area").innerHTML =
    '<div class="flashcard chinese-card" id="chinese-card" onclick="flipChineseCard()">' +
      '<div class="flashcard-face">' +
        '<div class="chinese-word">' + w.word + '</div>' +
        '<div class="chinese-hint">\ud83d\udc5c \u70b9\u51fb\u7ffb\u8f6c</div>' +
      '</div>' +
      '<div class="flashcard-face flashcard-back">' +
        '<div class="chinese-word" style="font-size:42px">' + w.word + '</div>' +
        '<div class="chinese-pinyin">' + w.pinyin + '</div>' +
        '<div class="chinese-meaning">' + w.meaning + '</div>' +
        (w.example ? '<div class="chinese-example">' + w.example + '</div>' : "") +
        (w.ex_pinyin ? '<div class="chinese-example-pinyin">' + w.ex_pinyin + '</div>' : "") +
        (w.ex_meaning ? '<div class="chinese-example-meaning">' + w.ex_meaning + '</div>' : "") +
        '<div style="margin-top:8px;font-size:12px;color:#999">' + (chineseIndex + 1) + ' / ' + total + '</div>' +
      '</div></div>';
  
  document.getElementById("chinese-card-controls").innerHTML =
    '<div style="display:flex;gap:16px;justify-content:center">' +
      '<button class="btn-primary" onclick="dontKnowChinese()" style="background:var(--error);color:white;padding:8px 24px;border-radius:8px;border:none;font-size:14px;cursor:pointer">\u274c \u4e0d\u8ba4\u8bc6</button>' +
      '<button class="btn-primary" onclick="knowChinese()" style="background:var(--success);color:white;padding:8px 24px;border-radius:8px;border:none;font-size:14px;cursor:pointer">\u2705 \u8ba4\u8bc6</button>' +
    '</div>' +
    '<div style="text-align:center;margin-top:8px;font-size:12px;color:var(--text-secondary)">\u5df2\u8ba4\u8bc6' + chineseKnown.length + ' 个</div>';
}

function flipChineseCard() {
  chineseFlipped = !chineseFlipped;
  var card = document.getElementById("chinese-card");
  if (card) card.classList.toggle("flipped", chineseFlipped);
}

function knowChinese() {
  if (chineseIndex < chineseWords.length) {
    chineseKnown.push(chineseWords[chineseIndex]);
    chineseIndex++;
    renderChineseCard();
  }
}

function dontKnowChinese() {
  if (chineseIndex < chineseWords.length) {
    chineseUnknown.push(chineseWords[chineseIndex]);
    chineseIndex++;
    renderChineseCard();
  }
}

function nextChineseWord() {
  chineseIndex++;
  renderChineseCard();
}

// ========== Quiz ==========
function initQuiz() {
  const all = getAllWords();
  const shuffled = all.sort(() => Math.random() - 0.5);
  quizWords = shuffled.slice(0, 10);
  quizIndex = 0;
  quizCorrect = 0;
  renderQuiz();
}

function renderQuiz() {
  if (quizIndex >= quizWords.length) {
    const pct = Math.round(quizCorrect / quizWords.length * 100);
    const grade = pct >= 90 ? "\ud83c\udf89 \u592a\u68d2\u4e86\uff01" : pct >= 70 ? "\ud83d\ude20 \u4e0d\u9519\uff01" : pct >= 50 ? "\ud83d\udcad \u52a0\u6cb9\uff01" : "\ud83d\udcc9 \u7ee7\u7eed\u52aa\u529b\uff01";
    document.getElementById("quiz-area").innerHTML =
      '<div class="quiz-result">' +
        '<div style="font-size:48px;margin-bottom:12px">' + (pct >= 90 ? "🏳" : "\ud83c\udf89") + '</div>' +
        '<div class="score">' + quizCorrect + " / " + quizWords.length + '</div>' +
        '<div class="score-label">正确率' + pct + '%</div>' +
        '<div style="font-size:18px;margin-top:8px;font-weight:600">' + grade + '</div>' +
        '<button class="btn-primary" onclick="initQuiz()" style="margin-top:16px">\u518d\u6765\u4e00\u6b21</button>' +
        '<button class="btn-secondary" onclick="showPage(\'home\')">\u8fd4\u56de\u9996\u9875</button></div>';
    return;
  }
  
  const w = quizWords[quizIndex];
  const correctMeaning = w.meaning;
  const correctWord = w.word;
  const all = getAllWords();
  
  const mode = Math.random() > 0.5 ? "en2cn" : "cn2en";
  
  // en2cn: 閫夐」涓轰腑鏂囬噴涔夛紱cn2en: 閫夐」涓鸿嫳鏂囧崟璇?
  let options, correctAnswer;
  if (mode === "en2cn") {
    options = [correctMeaning];
    const others = all.filter(x => x.meaning !== correctMeaning)
      .sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.meaning);
    options = [...options, ...others].sort(() => Math.random() - 0.5);
    correctAnswer = correctMeaning;
  } else {
    options = [correctWord];
    const others = all.filter(x => x.word !== correctWord)
      .sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.word);
    options = [...options, ...others].sort(() => Math.random() - 0.5);
    correctAnswer = correctWord;
  }
  
  const question = mode === "en2cn"
    ? '选择 "<span class="q-word">' + w.word + '</span>" 的正确答案解析：'
    : '"' + w.meaning + '" \u5bf9\u5e94\u7684\u82f1\u6587\u5355\u8bcd\u662f\uff1a';
  
  // Generate options
  let optsHtml = "";
  for (let i = 0; i < options.length; i++) {
    optsHtml += '<div class="quiz-option" data-opt="' + i + '" onclick="selectQuiz(this, \'' +
      options[i].replace(/'/g, "\\'") + '\', \'' +
      correctAnswer.replace(/'/g, "\\'") + '\')">' + options[i] + '</div>';
  }
  
  let dotsHtml = "";
  for (let i = 0; i < quizWords.length; i++) {
    let cls = "";
    if (i < quizIndex) cls = i < quizCorrect ? "correct" : "wrong";
    dotsHtml += '<div class="quiz-dot ' + cls + '"></div>';
  }
  
  document.getElementById("quiz-area").innerHTML =
    '<div class="quiz-progress">' + dotsHtml + '</div>' +
    '<div class="quiz-question">' + question + '</div>' +
    '<div class="quiz-options">' + optsHtml + '</div>' +
    '<div style="text-align:center;margin-top:12px;font-size:12px;color:var(--text-secondary)">' + (quizIndex + 1) + " / " + quizWords.length + '</div>';
}

function selectQuiz(el, selected, correct) {
  document.querySelectorAll(".quiz-option").forEach(o => { o.onclick = null; o.style.cursor = "default"; });
  const isCorrect = selected === correct;
  if (isCorrect) quizCorrect++;
  el.classList.add(isCorrect ? "correct" : "wrong");
  document.querySelectorAll(".quiz-option").forEach(o => {
    if (o.dataset.opt !== undefined && o.textContent === correct) o.classList.add("correct");
  });
  saveProgress(quizWords[quizIndex].id, isCorrect);
  setTimeout(() => { quizIndex++; renderQuiz(); }, 800);
}

// ========== Settings ==========
function loadSettings() {
  const goal = localStorage.getItem("english_daily_goal") || "10";
  document.querySelectorAll(".goal-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.goal === goal);
    btn.onclick = function() {
      localStorage.setItem("english_daily_goal", this.dataset.goal);
      document.querySelectorAll(".goal-option").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      showToast("已更新每日目标");
    };
  });
  
  const all = getAllWords();
  const progress = getProgress();
  const custom = getCustomWords();
  document.getElementById("stat-total-words").textContent = all.length;
  document.getElementById("stat-builtin").textContent = VOCABULARY.length;
  document.getElementById("stat-custom").textContent = custom.length;
  document.getElementById("stat-reviewed").textContent = Object.keys(progress).length;
  
  document.getElementById("btn-clear-data").onclick = function() {
    if (confirm("确定要清空所有学习数据吗？")) {
      localStorage.removeItem(STORAGE_KEY);
      showToast("数据已清空");
      loadSettings();
    }
  };
}

// ========== Add Word ==========
function initAddWord() {
  document.getElementById("add-word-btn").addEventListener("click", function() {
    const word = document.getElementById("new-word").value.trim();
    const meaning = document.getElementById("new-meaning").value.trim();
    if (!word || !meaning) { showToast("请至少填写单词和释义"); return; }
    addCustomWord({
      word: word, meaning: meaning,
      phonetic: document.getElementById("new-phonetic").value.trim() || "",
      example: document.getElementById("new-example").value.trim() || "",
      level: 1
    });
    ["new-word","new-meaning","new-phonetic","new-example"].forEach(id => document.getElementById(id).value = "");
    showToast("单词已添加");
    loadWordList();
  });
}

// ========== Modal / Toast ==========
function closeModal() {
  document.getElementById("modal-overlay").classList.remove("show");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

