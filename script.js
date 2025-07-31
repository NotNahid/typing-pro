// Global variables
let currentText = '';
let lines = [];
let currentLine = 0;
let currentChar = 0;
let isActive = false;
let elapsedSeconds = 0;
let currentPage = 0;
let linesPerPage = 6;
let totalChars = 0;
let correctChars = 0;
let errors = 0;
let topWPM = 0;
let timer = null;
let typedText = '';

// Sample texts for library
const libraryTexts = {
  'sample': `Welcome to TypePractice, a free and open-source tool for improving your typing speed and accuracy.

This sample text demonstrates the core functionality. You can upload your own text or PDF files to practice with content that matters to you.

The application tracks your words per minute (WPM), accuracy, and provides real-time feedback as you type. Notice the visual cues for correct and incorrect characters.

Advanced features include a dark mode, pagination for long documents, pause/resume functionality, and detailed statistics tracking.

Begin by uploading a file, selecting a book from the library, or simply continue practicing with this sample.

Remember to maintain good posture and take regular breaks to avoid strain. Happy typing!`,

  'pride-prejudice': `Pride and Prejudice
by Jane Austen

Chapter 1

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"`,

  'moby-dick': `Moby Dick
by Herman Melville

Chapter 1. Loomings.

Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can.`,

  'sherlock-holmes': `The Adventures of Sherlock Holmes
by Arthur Conan Doyle

ADVENTURE I. A SCANDAL IN BOHEMIA

I.

To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position.`,

  'great-gatsby': `The Great Gatsby
by F. Scott Fitzgerald

Chapter 1

In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.

“Whenever you feel like criticizing any one,” he told me, “just remember that all the people in this world haven’t had the advantages that you’ve had.”

He didn’t say any more, but we’ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I’m inclined to reserve all judgements, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.`,

  'frankenstein': `Frankenstein; or, The Modern Prometheus
by Mary Wollstonecraft Shelley

Letter 1

To Mrs. Saville, England.

St. Petersburgh, Dec. 11th, 17—

You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.

I am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight. Do you understand this feeling?`,
  
  'two-cities': `A Tale of Two Cities
by Charles Dickens

Book the First--Recalled to Life

Chapter 1. The Period

It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way—in short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only.`,

  'dracula': `Dracula
by Bram Stoker

Chapter 1

Jonathan Harker's Journal
(Kept in shorthand.)

3 May. Bistritz.—Left Munich at 8:35 P. M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could walk through the streets. I feared to go very far from the station, as we had arrived late and would start as near the correct time as possible. The impression I had was that we were leaving the West and entering the East; the most western of splendid bridges over the Danube, which is here of noble width and depth, took us among the traditions of Turkish rule.`
};

// --- State Persistence ---

function saveState() {
    if (!lines || lines.length === 0) return; // Don't save empty state
    const state = {
        currentText,
        documentTitle: document.getElementById('documentTitle').textContent,
        lines,
        currentLine,
        currentPage,
        elapsedSeconds,
        totalChars,
        correctChars,
        errors,
        topWPM,
        theme: document.body.classList.contains('dark') ? 'dark' : 'light'
    };
    localStorage.setItem('typePracticeState', JSON.stringify(state));
}

function loadState() {
    const savedState = localStorage.getItem('typePracticeState');
    if (savedState) {
        const state = JSON.parse(savedState);
        currentText = state.currentText;
        document.getElementById('documentTitle').textContent = state.documentTitle;
        lines = state.lines;
        currentLine = state.currentLine;
        currentPage = state.currentPage;
        elapsedSeconds = state.elapsedSeconds;
        totalChars = state.totalChars;
        correctChars = state.correctChars;
        errors = state.errors;
        topWPM = state.topWPM;

        if (state.theme === 'dark') {
            document.body.classList.add('dark');
        }
        updateTimeDisplay();
        updateAllStatDisplays();
        updateProgress();
        updatePagination();
        renderTypingArea();

        if(elapsedSeconds > 0 || currentLine > 0) {
             pauseTest(true); // Go into paused state on load
        }
        return true;
    }
    return false;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  if (!loadState()) {
      // If no state, load default and set theme based on system preference
      loadBook('sample');
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.body.classList.add('dark');
      }
  }
});

// Save state before user leaves the page
window.addEventListener('beforeunload', () => {
    if (isActive || elapsedSeconds > 0 || currentLine > 0) {
        saveState();
    }
});

function setupEventListeners() {
  document.getElementById('fileInput').addEventListener('change', handleFileUpload);
  const hiddenInput = document.getElementById('hiddenInput');
  const typingArea = document.getElementById('typingArea');
  
  hiddenInput.addEventListener('input', handleInput);
  hiddenInput.addEventListener('keydown', handleKeyDown);
  
  typingArea.addEventListener('click', () => focusInput());
}

function focusInput() {
  if (isActive && lines.length > 0) {
    document.getElementById('hiddenInput').focus();
  }
}

function loadBook(bookId) {
  const text = libraryTexts[bookId] || libraryTexts['sample'];
  processText(text, getBookTitle(bookId));
  showTab('practice');
}

function getBookTitle(bookId) {
  const titles = {
    'sample': 'Sample Text',
    'pride-prejudice': 'Pride and Prejudice',
    'moby-dick': 'Moby Dick',
    'sherlock-holmes': 'The Adventures of Sherlock Holmes',
    'great-gatsby': 'The Great Gatsby',
    'frankenstein': 'Frankenstein',
    'two-cities': 'A Tale of Two Cities',
    'dracula': 'Dracula'
  };
  return titles[bookId] || 'Unknown Document';
}

function processText(text, title = 'Uploaded Text') {
  // New text loaded, so reset everything
  resetTest(true); 
  
  currentText = text;
  lines = text.split('\n').filter(line => line.trim() !== '' || line === ''); // Keep empty lines for structure
  
  document.getElementById('documentTitle').textContent = title;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const estimatedTime = Math.ceil(wordCount / 40);
  document.getElementById('fileInfo').textContent = 
    `${lines.length} lines, ${wordCount} words, est. ${estimatedTime} min @ 40 WPM`;
  
  resetTest();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  
  if (file.type === 'application/pdf') {
    reader.onload = e => processPDF(e.target.result, file.name);
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload = e => processText(e.target.result, file.name);
    reader.readAsText(file);
  }
}

async function processPDF(arrayBuffer, fileName) {
  try {
    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    processText(fullText, fileName);
  } catch (error) {
    alert('Error processing PDF: ' + error.message);
  }
}

function renderTypingArea() {
  const typingArea = document.getElementById('typingArea');
  
  if (lines.length === 0) {
    typingArea.innerHTML = `
      <div class="upload-area" onclick="document.getElementById('fileInput').click()">
        <div class="upload-icon">📄</div>
        <h3>Upload a file to get started</h3>
        <p>Practice your typing with any .txt or .pdf document.</p>
      </div>`;
    return;
  }

  const hasStarted = elapsedSeconds > 0 || currentLine > 0;
  if (!isActive && !hasStarted) {
    typingArea.innerHTML = `<div class="start-hint">Click "Start" to begin</div>${renderLines()}`;
  } else {
     typingArea.innerHTML = renderLines();
  }

  typingArea.classList.toggle('active', isActive);
  const currentLineEl = typingArea.querySelector('.current');
  if (currentLineEl) {
      currentLineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function renderLines() {
  if (!lines || lines.length === 0) return '';
  
  const startLine = currentPage * linesPerPage;
  const endLine = Math.min(startLine + linesPerPage, lines.length);
  const visibleLines = lines.slice(startLine, endLine);

  return visibleLines.map((line, index) => {
    const lineIndex = startLine + index;
    const isCurrentLine = lineIndex === currentLine;
    const isCompleted = lineIndex < currentLine;
    
    let lineClass = 'typing-line';
    if (isCurrentLine) lineClass += ' current';
    if (isCompleted) lineClass += ' completed';
    
    let lineContent = '';
    if (isCurrentLine && isActive) {
        lineContent = [...line].map((char, i) => {
            let charClass = 'char';
            if (i < typedText.length) {
                charClass += typedText[i] === char ? ' correct' : ' incorrect';
            }
            if (i === typedText.length) {
                charClass += ' cursor';
            }
            return `<span class="${charClass}">${char}</span>`;
        }).join('');
         if (typedText.length >= line.length) {
            lineContent += '<span class="char cursor"></span>';
        }
    } else {
        lineContent = line || ' '; // Render a space for empty lines to maintain height
    }
    
    return `<div class="${lineClass}">${lineContent}</div>`;
  }).join('');
}

function handleInput(event) {
  if (!isActive || currentLine >= lines.length) return;
  
  if (!timer) {
    startTimer();
  }
  
  typedText = event.target.value;
  
  renderTypingArea();
  updateStatDisplay();
}

function handleKeyDown(event) {
  if (!isActive || currentLine >= lines.length) return;
  
  if (event.key === 'Enter') {
    event.preventDefault();
    
    const currentLineText = lines[currentLine] || '';
    for (let i = 0; i < typedText.length; i++) {
      totalChars++;
      if (i < currentLineText.length && typedText[i] === currentLineText[i]) {
        correctChars++;
      } else {
        errors++;
      }
    }
    if(typedText.length < currentLineText.length){
        errors += (currentLineText.length - typedText.length);
        totalChars += (currentLineText.length - typedText.length);
    }

    moveToNextLine();
  }
}

function moveToNextLine() {
  currentLine++;
  typedText = '';
  document.getElementById('hiddenInput').value = '';
  
  if (currentLine >= lines.length) {
    completeTest();
    return;
  }
  
  const newPage = Math.floor(currentLine / linesPerPage);
  if (newPage !== currentPage) {
    currentPage = newPage;
    updatePagination();
  }
  
  renderTypingArea();
  updateProgress();
}

function updateAllStatDisplays() {
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    document.getElementById("wpmValue").textContent = '0'; // WPM is 0 when not active
    document.getElementById("accuracyValue").textContent = `${accuracy}%`;
    document.getElementById("totalChars").textContent = totalChars;
    document.getElementById("correctChars").textContent = correctChars;
    document.getElementById("errorCount").textContent = errors;
    document.getElementById("topWPM").textContent = topWPM;
}

function updateStatDisplay() {
  if (elapsedSeconds <= 0) return;
  
  const currentLineText = lines[currentLine] || '';
  let currentCorrect = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (i < currentLineText.length && typedText[i] === currentLineText[i]) {
      currentCorrect++;
    }
  }
  
  const elapsedMinutes = elapsedSeconds / 60;
  const grossWPMChars = correctChars + currentCorrect;
  const wpm = elapsedMinutes > 0 ? Math.round((grossWPMChars / 5) / elapsedMinutes) : 0;
  
  const currentErrors = typedText.length - currentCorrect;
  const totalTyped = totalChars + typedText.length;
  const totalCorrect = correctChars + currentCorrect;
  const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;
  
  if (wpm > topWPM) {
    topWPM = wpm;
    document.getElementById("topWPM").textContent = topWPM;
  }
  
  document.getElementById("wpmValue").textContent = wpm;
  document.getElementById("accuracyValue").textContent = accuracy + "%";
  document.getElementById("totalChars").textContent = totalTyped;
  document.getElementById("correctChars").textContent = totalCorrect;
  document.getElementById("errorCount").textContent = errors + currentErrors;
}

function updateProgress() {
  const progress = lines.length > 0 ? (currentLine / lines.length) * 100 : 0;
  document.getElementById("progressBar").style.width = progress + "%";
  document.getElementById("progressValue").textContent = `${currentLine}/${lines.length}`;
}

function updateTimeDisplay() {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    document.getElementById("timeValue").textContent = 
      `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (!isActive) return;
    elapsedSeconds++;
    updateTimeDisplay();
    updateStatDisplay();
  }, 1000);
}

function startTest() {
  if (lines.length === 0) {
    alert("Please upload a file or select a book from the library first.");
    return;
  }
  
  isActive = true;
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("pauseBtn").style.display = "inline-flex";
  
  startTimer();
  renderTypingArea();
  focusInput();
}

function pauseTest(isInitialLoad = false) {
  isActive = false;
  document.getElementById("startBtn").style.display = "inline-flex";
  document.getElementById("startBtn").textContent = "▶ Resume";
  document.getElementById("pauseBtn").style.display = "none";
  
  if (timer) clearInterval(timer);
  timer = null;

  if (!isInitialLoad) {
      saveState();
  }
  renderTypingArea();
}

function resetTest(isNewText = false) {
  isActive = false;
  currentLine = 0;
  currentPage = 0;
  elapsedSeconds = 0;
  totalChars = 0;
  correctChars = 0;
  errors = 0;
  topWPM = 0;
  typedText = '';
  
  if (timer) clearInterval(timer);
  timer = null;
  
  if(!isNewText) {
      localStorage.removeItem('typePracticeState');
  }

  document.getElementById("hiddenInput").value = "";
  document.getElementById("startBtn").style.display = "inline-flex";
  document.getElementById("startBtn").textContent = "▶ Start";
  document.getElementById("pauseBtn").style.display = "none";
  
  updateTimeDisplay();
  updateAllStatDisplays();
  updateProgress();
  updatePagination();
  renderTypingArea();
}

function completeTest() {
  isActive = false;
  if (timer) clearInterval(timer);
  timer = null;
  
  document.getElementById("startBtn").style.display = "inline-flex";
  document.getElementById("startBtn").textContent = "▶ Start Over";
  document.getElementById("pauseBtn").style.display = "none";
  
  saveState();
  setTimeout(() => alert("Congratulations! You have completed the typing test!"), 100);
}

function previousPage() {
  if (currentPage > 0) {
    currentPage--;
    renderTypingArea();
    updatePagination();
  }
}

function nextPage() {
  const maxPage = Math.ceil(lines.length / linesPerPage) - 1;
  if (currentPage < maxPage) {
    currentPage++;
    renderTypingArea();
    updatePagination();
  }
}

function updatePagination() {
  const pagination = document.getElementById("pagination");
  const pageInfo = document.getElementById("pageInfo");
  
  if (lines.length <= linesPerPage) {
    pagination.style.display = "none";
    return;
  }
  
  pagination.style.display = "flex";
  const totalPages = Math.ceil(lines.length / linesPerPage);
  pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
  
  pagination.children[0].disabled = currentPage === 0;
  pagination.children[2].disabled = currentPage >= totalPages - 1;
}

function showTab(tabName, targetElement) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  
  document.getElementById(tabName + "Tab").classList.remove("hidden");
  
  if (targetElement) {
    targetElement.classList.add("active");
  } else {
    document.querySelector(`.tab[onclick*="'${tabName}'"]`).classList.add("active");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  saveState();
}