// DOM Elements
const conversationInput = document.getElementById('conversationInput');
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const compressBtn = document.getElementById('compressBtn');
const targetAI = document.getElementById('targetAI');
const compressionLevel = document.getElementById('compressionLevel');
const apiKeyGroup = document.getElementById('apiKeyGroup');
const apiKey = document.getElementById('apiKey');
const inputSection = document.getElementById('inputSection');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const loadingText = document.getElementById('loadingText');
const loadingBar = document.getElementById('loadingBar');
const compressedText = document.getElementById('compressedText');
const originalWords = document.getElementById('originalWords');
const compressedWords = document.getElementById('compressedWords');
const reductionPercent = document.getElementById('reductionPercent');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newCompressionBtn = document.getElementById('newCompressionBtn');

// API option radio buttons
const useOwnKeyRadio = document.getElementById('useOwnKey');
const useOurServiceRadio = document.getElementById('useOurService');

// Update word and character count
if (conversationInput) {
    conversationInput.addEventListener('input', () => {
        const text = conversationInput.value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;
        
        wordCount.textContent = `${words.toLocaleString()} words`;
        charCount.textContent = `${chars.toLocaleString()} characters`;
        
        // Enable compress button if there's enough content
        updateCompressButton();
    });

    // Handle API option changes
    document.querySelectorAll('input[name="apiOption"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (useOwnKeyRadio.checked) {
                apiKeyGroup.style.display = 'flex';
            } else {
                apiKeyGroup.style.display = 'none';
            }
            updateCompressButton();
        });
    });

    // Handle API key input
    if (apiKey) {
        apiKey.addEventListener('input', updateCompressButton);
    }

    // Compress button click handler
    if (compressBtn) {
        compressBtn.addEventListener('click', handleCompress);
    }

    // Copy button click handler
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(compressedText.textContent);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        });
    }

    // Download button click handler
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const blob = new Blob([compressedText.textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed-conversation.txt';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // New compression button click handler
    if (newCompressionBtn) {
        newCompressionBtn.addEventListener('click', () => {
            resultsSection.style.display = 'none';
            inputSection.style.display = 'block';
            conversationInput.value = '';
            updateCompressButton();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Update compress button state
function updateCompressButton() {
    if (!compressBtn) return;
    
    const text = conversationInput.value.trim();
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const hasContent = words >= 50; // Minimum 50 words
    
    if (useOwnKeyRadio.checked) {
        const hasApiKey = apiKey.value.trim().startsWith('sk-');
        compressBtn.disabled = !(hasContent && hasApiKey);
    } else {
        // Using our service - would need payment integration
        // For MVP, disable this option
        compressBtn.disabled = true;
        if (hasContent) {
            compressBtn.textContent = '🔜 Payment Integration Coming Soon';
        }
    }
}

// Handle compression
async function handleCompress() {
    const text = conversationInput.value.trim();
    const level = compressionLevel.value;
    const target = targetAI.value;
    const userApiKey = apiKey.value.trim();
    
    // Show loading
    inputSection.style.display = 'none';
    loadingSection.style.display = 'block';
    
    // Simulate loading progress
    const loadingMessages = [
        'Analyzing conversation structure...',
        'Identifying key decisions and facts...',
        'Extracting important context...',
        'Removing redundant information...',
        'Optimizing for handoff...',
        'Finalizing compression...'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length) {
            loadingText.textContent = loadingMessages[messageIndex];
            loadingBar.style.width = `${((messageIndex + 1) / loadingMessages.length) * 100}%`;
            messageIndex++;
        }
    }, 800);
    
    try {
        // Call OpenAI API for compression
        const compressed = await compressConversation(text, level, target, userApiKey);
        
        // Clear interval
        clearInterval(messageInterval);
        
        // Calculate stats
        const originalWordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        const compressedWordCount = compressed.split(/\s+/).filter(w => w.length > 0).length;
        const reduction = Math.round((1 - compressedWordCount / originalWordCount) * 100);
        
        // Show results
        compressedText.textContent = compressed;
        originalWords.textContent = originalWordCount.toLocaleString();
        compressedWords.textContent = compressedWordCount.toLocaleString();
        reductionPercent.textContent = reduction;
        
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        clearInterval(messageInterval);
        alert(`Error: ${error.message}\n\nPlease check your API key and try again.`);
        loadingSection.style.display = 'none';
        inputSection.style.display = 'block';
    }
}

// Compress conversation using OpenAI API
async function compressConversation(text, level, target, apiKey) {
    // Determine compression instructions based on level
    const compressionInstructions = {
        light: 'Compress this conversation by about 30%, keeping most details intact.',
        balanced: 'Compress this conversation by about 50%, keeping all important information.',
        aggressive: 'Compress this conversation by about 70%, keeping only essential information.',
        extreme: 'Compress this conversation by about 85%, keeping only the most critical information.'
    };
    
    // Determine target platform instructions
    const targetInstructions = {
        general: '',
        chatgpt: ' Optimize the summary for use with ChatGPT.',
        claude: ' Optimize the summary for use with Claude.',
        deepseek: ' Optimize the summary for use with DeepSeek.',
        gemini: ' Optimize the summary for use with Gemini.',
        perplexity: ' Optimize the summary for use with Perplexity.'
    };
    
    const systemPrompt = `You are an expert at compressing AI conversations into concise handoff summaries. 
Your task is to analyze the conversation and create a compressed version that:
- Preserves all key decisions, facts, and context
- Removes chitchat, redundancy, and unnecessary details
- Maintains chronological flow where important
- Extracts action items and next steps
- Uses clear, structured formatting

${compressionInstructions[level]}${targetInstructions[target]}

Format the output as follows:
PROJECT CONTEXT: Brief overview of what's being discussed
KEY DECISIONS: List of important decisions made
IMPORTANT FACTS: Critical information established
TECHNICAL DETAILS: Specifications, requirements, constraints
CURRENT STATUS: Where things stand now
ACTION ITEMS: What needs to happen next`;

    const userPrompt = `Please compress this AI conversation:

${text}`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 2000
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// Load API key from localStorage if available
window.addEventListener('DOMContentLoaded', () => {
    if (apiKey && localStorage.getItem('morechat_api_key')) {
        apiKey.value = localStorage.getItem('morechat_api_key');
        updateCompressButton();
    }
    
    // Save API key to localStorage when changed
    if (apiKey) {
        apiKey.addEventListener('change', () => {
            if (apiKey.value.trim()) {
                localStorage.setItem('morechat_api_key', apiKey.value.trim());
            }
        });
    }
});
